// State-level enforcement-to-rules pipeline.
//
// Glue layer between lib/compliance/state-scraper.ts (which only returns
// listing-page links) and the Claude-powered rule extractor + dedup insert
// path in lib/compliance-scraper.ts. Designed to run from the weekly
// /api/cron/weekly-refresh endpoint.
//
// Why a separate module:
//  - state-scraper.ts deliberately stops at link discovery so it can be
//    tested in isolation (no Anthropic / Supabase deps).
//  - lib/compliance-scraper.ts already has end-to-end article processing
//    but its driver (cron/scrape-rules) is hard-wired to the federal
//    COMPLIANCE_SOURCES list and ComplianceSource shape.
//  - This pipeline adapts a StateSource into the ComplianceSource-shaped
//    arg that upsertEnforcementAction expects, runs the existing extractor,
//    and inserts via insertRulesWithDedup with the parent enforcement
//    action id wired up.
//
// Budget shaping (don't raise without measurement):
//  MAX_DETAILS_PER_STATE is set to 3 so a worst-case wave is:
//    9 implemented sources x 3 details x ~5s Claude = ~135s
//  Vercel function maxDuration is 300s, leaving headroom for safeFetchHtml
//  retries, slow government sites, and the extract-rules dedup SELECT.
//  Each Claude call is expensive on the Anthropic budget too - the cap
//  exists for both reasons.
//
// Errors are caught per-state and per-link. The pipeline ONLY throws if
// something fundamentally broken (e.g. Supabase client unusable). Per-link
// errors are surfaced in the per-state result so the cron route returns
// them in its JSON response without taking down the whole sweep.
//
// DST drift: the cron schedule is fixed UTC. From Mar-Nov in Central time
// the route fires at 1am CDT, from Nov-Mar at midnight CST. The window is
// outside business hours either way - intentional, no user-visible impact.

import type { SupabaseClient } from "@supabase/supabase-js"
import { scrapeAllImplementedStates } from "@/lib/compliance/state-scraper"
import {
  safeFetchHtml,
  extractRulesFromText,
  insertRulesWithDedup,
  upsertEnforcementAction,
  type ComplianceSource,
} from "@/lib/compliance-scraper"
import * as cheerio from "cheerio"
import type { StateSource } from "@/lib/compliance/state-sources"

// Cap per state to keep the total wall-clock inside the 300s Vercel budget.
// Each detail page does up to two Claude Haiku calls (rule extraction +
// action metadata). Raising this requires measuring p95 latency first.
const MAX_DETAILS_PER_STATE = 3

// Per-fetch timeout for detail pages. Matches state-scraper.ts default.
const DETAIL_FETCH_TIMEOUT_MS = 15_000

// Default selector used when a state source has no detailSelector. Matches
// the selector-chain pattern in extractArticleText (comma-separated, tried
// in order; first match with >100 chars wins). "body" is the last-ditch
// fallback so government sites with bespoke markup still yield text.
const DEFAULT_DETAIL_SELECTOR = "article, main, .content, .field--name-body, body"

// Sampled-logging: first link processed always logs; then every Nth. Same
// pattern as state-scraper.ts so cron logs stay readable.
const DETAIL_LOG_SAMPLE = 5

export interface StatePipelineLinkError {
  url: string
  reason: string
}

export interface StatePipelinePerStateResult {
  state: string
  sourceName: string
  linksDiscovered: number
  detailsProcessed: number
  newRules: number
  // Per-link errors stay attached to their state so the route handler can
  // surface them without flattening the result shape.
  linkErrors?: StatePipelineLinkError[]
  // Top-level error means the state's listing scrape itself failed; no
  // links were available to process.
  error?: string
}

export interface StatePipelineResult {
  perState: StatePipelinePerStateResult[]
  totalNewRules: number
  totalDetailsProcessed: number
}

/**
 * Build a ComplianceSource-shaped object from a StateSource so the existing
 * upsertEnforcementAction + extractRulesFromText helpers can be reused.
 *
 * source_type on the enforcement_actions table is plain text (see
 * supabase/migrations/015_enforcement_actions.sql), not an enum, so the
 * "state_<kind>" namespace is safe to insert. The TypeScript
 * ComplianceSource.type union is narrower than the database column, hence
 * the cast - this is an intentional break in the type fiction maintained
 * by the federal-source path.
 */
function asComplianceSource(state: StateSource): ComplianceSource {
  return {
    id: `state_${state.state.toLowerCase()}_${state.kind}`,
    name: state.name,
    // The DB accepts arbitrary strings here; the TS union is narrower.
    type: `state_${state.kind}` as ComplianceSource["type"],
    listUrl: state.url,
    linkSelector: state.listSelector ?? "a",
    contentSelector: state.detailSelector ?? DEFAULT_DETAIL_SELECTOR,
    // category is best-effort; the action-rollup will overwrite this
    // post-insert based on the rules that come out of Claude.
    category: "health_claims",
  }
}

/**
 * Extract text from already-fetched detail HTML. Mirrors extractArticleText's
 * selector-chain logic but operates on a string instead of triggering another
 * fetch. We do this so the pipeline owns a single safeFetchHtml call per
 * detail page and selector matching is a pure function of the HTML.
 */
function extractTextFromHtml(html: string, contentSelector: string): string | null {
  const $ = cheerio.load(html)
  const selectors = contentSelector.split(",").map((s) => s.trim()).filter(Boolean)
  for (const sel of selectors) {
    const el = $(sel)
    if (el.length > 0) {
      const text = el.text().replace(/\s+/g, " ").trim()
      if (text.length > 100) {
        return text.slice(0, 15_000)
      }
    }
  }
  return null
}

/**
 * Drive the state-source scraper end-to-end: scrape implemented states,
 * fetch each finding's detail page, run the Claude rule extractor, and
 * insert deduped rules linked to a parent enforcement_action.
 *
 * Per-state and per-link errors are captured into the result rather than
 * thrown - the cron route uses HTTP status to signal whole-pipeline
 * failure, not per-source failure.
 */
export async function runStateRulesPipeline(
  supabase: SupabaseClient,
): Promise<StatePipelineResult> {
  const startedAt = Date.now()
  const scrapeResults = await scrapeAllImplementedStates()

  const perState: StatePipelinePerStateResult[] = []
  let totalNewRules = 0
  let totalDetailsProcessed = 0
  let detailLogCount = 0

  for (const sr of scrapeResults) {
    // Skip scaffolded / needs_research sources - they never made a network
    // call inside scrapeStateSource and have no links to process.
    if (sr.status === "skipped_scaffolded") continue

    const state = sr.source
    const stateResult: StatePipelinePerStateResult = {
      state: state.state,
      sourceName: state.name,
      linksDiscovered: sr.links.length,
      detailsProcessed: 0,
      newRules: 0,
    }

    if (sr.status !== "ok") {
      // fetch_failed / parse_failed / empty - capture the error and move on.
      stateResult.error = sr.error ?? sr.status
      perState.push(stateResult)
      continue
    }

    const candidates = sr.links.slice(0, MAX_DETAILS_PER_STATE)
    const linkErrors: StatePipelineLinkError[] = []
    const today = new Date().toISOString().split("T")[0]
    const adapter = asComplianceSource(state)

    for (const link of candidates) {
      const url = link.url
      try {
        // Single fetch per detail page. safeFetchHtml enforces SSRF +
        // 2 MB cap; cheerio parsing happens here in extractTextFromHtml.
        const html = await safeFetchHtml(url, DETAIL_FETCH_TIMEOUT_MS)
        if (!html) {
          linkErrors.push({ url, reason: "safeFetchHtml returned null" })
          continue
        }

        const selector = state.detailSelector ?? DEFAULT_DETAIL_SELECTOR
        let articleText = extractTextFromHtml(html, selector)

        // If the source had a detailSelector but it missed (e.g., site
        // markup drift), try the default chain as a last resort. This
        // matches the spec's "fall back to extractArticleText" intent
        // for the bare-body path.
        if (!articleText && state.detailSelector) {
          articleText = extractTextFromHtml(html, DEFAULT_DETAIL_SELECTOR)
        }

        if (!articleText) {
          linkErrors.push({ url, reason: "no article text after selector chain" })
          continue
        }

        // Upsert the parent enforcement_action first so the child rules
        // can reference it. If the action upsert fails (DB error, Claude
        // metadata extraction throws), we skip rule insert too.
        const actionId = await upsertEnforcementAction(
          adapter,
          url,
          articleText,
          today,
          supabase,
        )
        if (!actionId) {
          linkErrors.push({ url, reason: "upsertEnforcementAction returned null" })
          continue
        }

        // extractRulesFromText returns { rules, documentDate } since the
        // source-date wave; use the parsed issuance date for the rules'
        // source_date so freshness queries measure when the agency issued
        // the letter, not when we ingested it. enforcement_actions keep the
        // ingest date as before (they're for library/audit not freshness).
        const { rules, documentDate } = await extractRulesFromText(
          articleText,
          state.name,
          adapter.type,
        )
        if (rules.length === 0) {
          stateResult.detailsProcessed++
          totalDetailsProcessed++
          continue
        }

        const insertedCount = await insertRulesWithDedup(
          rules,
          url,
          state.name,
          documentDate ?? today,
          supabase,
          actionId,
        )

        stateResult.newRules += insertedCount
        stateResult.detailsProcessed++
        totalNewRules += insertedCount
        totalDetailsProcessed++

        detailLogCount++
        if (detailLogCount === 1 || detailLogCount % DETAIL_LOG_SAMPLE === 0) {
          console.info(
            "[state-pipeline] processed " + state.state + " " + url +
              " new_rules=" + insertedCount +
              " (total details since start: " + detailLogCount + ")",
          )
        }
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err)
        linkErrors.push({ url, reason })
        console.error("[state-pipeline] link error " + state.state + " " + url + ": " + reason)
      }
    }

    if (linkErrors.length > 0) {
      stateResult.linkErrors = linkErrors
    }
    perState.push(stateResult)
  }

  const elapsedMs = Date.now() - startedAt
  console.info(
    "[state-pipeline] done states=" + perState.length +
      " details=" + totalDetailsProcessed +
      " new_rules=" + totalNewRules +
      " elapsed_ms=" + elapsedMs,
  )

  return {
    perState,
    totalNewRules,
    totalDetailsProcessed,
  }
}
