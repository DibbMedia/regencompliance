export const maxDuration = 300

import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { createBroadcastNotification } from "@/lib/notifications"
import { anthropic } from "@/lib/anthropic"
import {
  COMPLIANCE_SOURCES,
  extractRegenLinks,
  extractArticleText,
  extractRulesFromText,
  insertRulesWithDedup,
  type ComplianceSource,
} from "@/lib/compliance-scraper"

// ---------------------------------------------------------------------------
// Metrics tracker
// ---------------------------------------------------------------------------

interface DeepScrapeMetrics {
  new_rules: number
  rules_improved: number
  duplicates_removed: number
  treatments_assigned: number
  sources_processed: Record<
    string,
    { success: boolean; links_found: number; new_rules: number; errors: string[] }
  >
  quality_review: { reviewed: number; improvements_suggested: number }
  dedup_sweep: { pairs_checked: number; confirmed_duplicates: number }
  duration_ms: number
}

// ---------------------------------------------------------------------------
// Helper: safe JSON parse from Claude response
// ---------------------------------------------------------------------------

function parseClaudeJson<T>(text: string): T | null {
  try {
    let jsonStr = text.trim()
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
    }
    return JSON.parse(jsonStr) as T
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// GET handler — monthly deep scrape
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  // 1. Auth check
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const startTime = Date.now()
  const supabase = createServiceClient()

  const metrics: DeepScrapeMetrics = {
    new_rules: 0,
    rules_improved: 0,
    duplicates_removed: 0,
    treatments_assigned: 0,
    sources_processed: {},
    quality_review: { reviewed: 0, improvements_suggested: 0 },
    dedup_sweep: { pairs_checked: 0, confirmed_duplicates: 0 },
    duration_ms: 0,
  }

  // =========================================================================
  // 2. Deep Archive Crawl — 15 links per source
  // =========================================================================

  for (const source of COMPLIANCE_SOURCES) {
    const sourceMetrics = {
      success: false,
      links_found: 0,
      new_rules: 0,
      errors: [] as string[],
    }
    metrics.sources_processed[source.id] = sourceMetrics

    try {
      let allLinks: string[] = []

      // For FDA sources, try paginated results
      if (source.type === "fda_warning" || source.type === "fda_483") {
        const pageUrls = [
          source.listUrl,
          `${source.listUrl}?page=1`,
          `${source.listUrl}?page=2`,
        ]
        for (const pageUrl of pageUrls) {
          try {
            const tempSource = { ...source, listUrl: pageUrl }
            const pageLinks = await extractRegenLinks(tempSource, 10)
            allLinks.push(...pageLinks)
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e)
            sourceMetrics.errors.push(`Pagination ${pageUrl}: ${msg}`)
          }
        }
      }
      // For FTC sources, also try search endpoint with regen keywords
      else if (source.type === "ftc_press" || source.type === "ftc_guidance") {
        // Normal listing page
        try {
          const listLinks = await extractRegenLinks(source, 10)
          allLinks.push(...listLinks)
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          sourceMetrics.errors.push(`List page: ${msg}`)
        }

        // Search endpoint with regen keywords
        const searchKeywords = ["stem cell", "regenerative medicine", "exosome", "PRP therapy"]
        for (const keyword of searchKeywords) {
          try {
            const searchUrl = `https://www.ftc.gov/search?query=${encodeURIComponent(keyword)}`
            const searchSource: ComplianceSource = {
              ...source,
              listUrl: searchUrl,
              linkSelector: "a",
            }
            const searchLinks = await extractRegenLinks(searchSource, 5)
            allLinks.push(...searchLinks)
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e)
            sourceMetrics.errors.push(`FTC search "${keyword}": ${msg}`)
          }
        }
      }
      // DOJ and other sources — just increase link count
      else {
        try {
          const links = await extractRegenLinks(source, 15)
          allLinks.push(...links)
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          sourceMetrics.errors.push(`List page: ${msg}`)
        }
      }

      // Deduplicate collected links
      allLinks = [...new Set(allLinks)]

      // Cap at 15 links per source
      allLinks = allLinks.slice(0, 15)
      sourceMetrics.links_found = allLinks.length
      sourceMetrics.success = true

      if (allLinks.length === 0) continue

      // Filter out URLs already in the database
      const { data: existingRows } = await supabase
        .from("compliance_rules")
        .select("source_url")
        .in("source_url", allLinks)

      const existingUrls = new Set(existingRows?.map((r) => r.source_url) ?? [])
      const newLinks = allLinks.filter((url) => !existingUrls.has(url))

      // Process each new link
      for (const url of newLinks) {
        try {
          const articleText = await extractArticleText(url, source.contentSelector)
          if (!articleText) continue

          const rules = await extractRulesFromText(articleText, source.name, source.type)
          if (rules.length === 0) continue

          const today = new Date().toISOString().split("T")[0]
          const insertedCount = await insertRulesWithDedup(
            rules,
            url,
            source.name,
            today,
            supabase,
          )
          sourceMetrics.new_rules += insertedCount
          metrics.new_rules += insertedCount
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          sourceMetrics.errors.push(`${url}: ${msg}`)
          console.error(`[deep-scrape] Error processing ${source.id} article ${url}:`, e)
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      sourceMetrics.errors.push(msg)
      console.error(`[deep-scrape] Error scraping ${source.id}:`, e)
    }
  }

  // =========================================================================
  // 3. Rule Quality Review — Claude Sonnet reviews batches of 20
  // =========================================================================

  try {
    const { data: activeRules } = await supabase
      .from("compliance_rules")
      .select("id, banned_phrase, banned_phrase_variants, compliant_alternative, risk_level, category, applies_to")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (activeRules && activeRules.length > 0) {
      const BATCH_SIZE = 20
      // Process up to 3 batches (60 rules) to stay within time limits
      const maxBatches = Math.min(Math.ceil(activeRules.length / BATCH_SIZE), 3)

      for (let batchIdx = 0; batchIdx < maxBatches; batchIdx++) {
        const batch = activeRules.slice(batchIdx * BATCH_SIZE, (batchIdx + 1) * BATCH_SIZE)
        metrics.quality_review.reviewed += batch.length

        try {
          const rulesForReview = batch.map((r, i) => ({
            index: i,
            banned_phrase: r.banned_phrase,
            banned_phrase_variants: r.banned_phrase_variants,
            compliant_alternative: r.compliant_alternative,
            risk_level: r.risk_level,
            category: r.category,
          }))

          const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250514",
            max_tokens: 4096,
            messages: [
              {
                role: "user",
                content: `Review these compliance rules for accuracy and completeness. For each rule, suggest:
1. Whether it should remain active (true/false)
2. Any improved compliant_alternative text
3. Any missing banned_phrase_variants

Return as JSON array matching input order. Each element:
{
  "index": number,
  "should_remain_active": boolean,
  "improved_alternative": string | null,
  "additional_variants": string[] | null,
  "reason": string
}

Rules to review:
${JSON.stringify(rulesForReview, null, 2)}`,
              },
            ],
          })

          const content = response.content[0]
          if (content.type !== "text") continue

          interface QualityReview {
            index: number
            should_remain_active: boolean
            improved_alternative: string | null
            additional_variants: string[] | null
            reason: string
          }

          const reviews = parseClaudeJson<QualityReview[]>(content.text)
          if (!reviews || !Array.isArray(reviews)) continue

          for (const review of reviews) {
            const rule = batch[review.index]
            if (!rule) continue

            const updates: Record<string, unknown> = {}
            let hasUpdate = false

            // Apply improved alternative if provided
            if (
              review.improved_alternative &&
              review.improved_alternative !== rule.compliant_alternative
            ) {
              updates.compliant_alternative = review.improved_alternative
              hasUpdate = true
            }

            // Merge additional variants if provided
            if (review.additional_variants && review.additional_variants.length > 0) {
              const existingVariants = rule.banned_phrase_variants ?? []
              const existingSet = new Set(existingVariants.map((v: string) => v.toLowerCase()))
              const newVariants = review.additional_variants.filter(
                (v) => !existingSet.has(v.toLowerCase()),
              )
              if (newVariants.length > 0) {
                updates.banned_phrase_variants = [...existingVariants, ...newVariants]
                hasUpdate = true
              }
            }

            // Don't deactivate automatically — just log the recommendation
            if (!review.should_remain_active) {
              console.log(
                `[deep-scrape] Quality review recommends deactivating rule ${rule.id}: ${review.reason}`,
              )
            }

            if (hasUpdate) {
              updates.updated_at = new Date().toISOString()
              const { error } = await supabase
                .from("compliance_rules")
                .update(updates)
                .eq("id", rule.id)

              if (!error) {
                metrics.rules_improved++
              }
            }
          }
        } catch (e) {
          console.error(`[deep-scrape] Quality review batch ${batchIdx} error:`, e)
        }
      }
    }
  } catch (e) {
    console.error("[deep-scrape] Quality review failed:", e)
  }

  // =========================================================================
  // 4. Semantic Dedup Sweep
  // =========================================================================

  try {
    const { data: allRules } = await supabase
      .from("compliance_rules")
      .select("id, banned_phrase, compliant_alternative")
      .eq("is_active", true)
      .order("created_at", { ascending: true })

    if (allRules && allRules.length > 1) {
      // Find pairs where one banned_phrase is a substring of another
      const flaggedPairs: Array<{
        ruleA: (typeof allRules)[0]
        ruleB: (typeof allRules)[0]
      }> = []

      for (let i = 0; i < allRules.length; i++) {
        for (let j = i + 1; j < allRules.length; j++) {
          const phraseA = allRules[i].banned_phrase.toLowerCase().trim()
          const phraseB = allRules[j].banned_phrase.toLowerCase().trim()

          if (phraseA === phraseB || phraseA.includes(phraseB) || phraseB.includes(phraseA)) {
            flaggedPairs.push({ ruleA: allRules[i], ruleB: allRules[j] })
          }
        }
        // Cap at 20 pairs to stay within time limits
        if (flaggedPairs.length >= 20) break
      }

      metrics.dedup_sweep.pairs_checked = flaggedPairs.length

      // Confirm duplicates with Claude Haiku in batches
      const DEDUP_BATCH = 10
      for (let i = 0; i < flaggedPairs.length; i += DEDUP_BATCH) {
        const batch = flaggedPairs.slice(i, i + DEDUP_BATCH)

        try {
          const pairsForReview = batch.map((pair, idx) => ({
            index: idx,
            rule_a: {
              id: pair.ruleA.id,
              banned_phrase: pair.ruleA.banned_phrase,
              compliant_alternative: pair.ruleA.compliant_alternative,
            },
            rule_b: {
              id: pair.ruleB.id,
              banned_phrase: pair.ruleB.banned_phrase,
              compliant_alternative: pair.ruleB.compliant_alternative,
            },
          }))

          const response = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 2048,
            messages: [
              {
                role: "user",
                content: `Are these pairs of compliance rules true duplicates (covering the same violation)?

For each pair, return:
{
  "index": number,
  "is_duplicate": boolean,
  "keep": "a" | "b" (which rule has more detail/better alternative)
}

Return as JSON array.

Pairs:
${JSON.stringify(pairsForReview, null, 2)}`,
              },
            ],
          })

          const content = response.content[0]
          if (content.type !== "text") continue

          interface DedupResult {
            index: number
            is_duplicate: boolean
            keep: "a" | "b"
          }

          const dedupResults = parseClaudeJson<DedupResult[]>(content.text)
          if (!dedupResults || !Array.isArray(dedupResults)) continue

          for (const result of dedupResults) {
            if (!result.is_duplicate) continue

            const pair = batch[result.index]
            if (!pair) continue

            // Deactivate the one with less detail (shorter compliant_alternative)
            // If Claude says keep "a", deactivate "b" and vice versa
            // Fallback: deactivate the one with shorter compliant_alternative
            let deactivateId: string
            if (result.keep === "a") {
              deactivateId = pair.ruleB.id
            } else if (result.keep === "b") {
              deactivateId = pair.ruleA.id
            } else {
              // Fallback: shorter alternative gets deactivated
              const altA = pair.ruleA.compliant_alternative ?? ""
              const altB = pair.ruleB.compliant_alternative ?? ""
              deactivateId = altA.length >= altB.length ? pair.ruleB.id : pair.ruleA.id
            }

            const { error } = await supabase
              .from("compliance_rules")
              .update({ is_active: false, updated_at: new Date().toISOString() })
              .eq("id", deactivateId)

            if (!error) {
              metrics.duplicates_removed++
              metrics.dedup_sweep.confirmed_duplicates++
              console.log(`[deep-scrape] Dedup: deactivated rule ${deactivateId}`)
            }
          }
        } catch (e) {
          console.error(`[deep-scrape] Dedup batch error:`, e)
        }
      }
    }
  } catch (e) {
    console.error("[deep-scrape] Dedup sweep failed:", e)
  }

  // =========================================================================
  // 5. Treatment Assignment — fill empty applies_to
  // =========================================================================

  try {
    const { data: unassignedRules } = await supabase
      .from("compliance_rules")
      .select("id, banned_phrase, compliant_alternative")
      .eq("is_active", true)
      .or("applies_to.is.null,applies_to.eq.{}")
      .limit(50)

    if (unassignedRules && unassignedRules.length > 0) {
      // Process in batches of 20
      const TREATMENT_BATCH = 20
      for (let i = 0; i < unassignedRules.length; i += TREATMENT_BATCH) {
        const batch = unassignedRules.slice(i, i + TREATMENT_BATCH)

        try {
          const rulesForAssignment = batch.map((r, idx) => ({
            index: idx,
            banned_phrase: r.banned_phrase,
            compliant_alternative: r.compliant_alternative,
          }))

          const response = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 2048,
            messages: [
              {
                role: "user",
                content: `For each compliance rule below, assign the appropriate treatment types from this list:
stem_cell, prp, exosomes, bmac, whartons_jelly, prolotherapy, peptide, iv_therapy, hormone_therapy

A rule can apply to multiple treatments. Only assign treatments that are clearly relevant.

Return as JSON array:
{ "index": number, "applies_to": string[] }

Rules:
${JSON.stringify(rulesForAssignment, null, 2)}`,
              },
            ],
          })

          const content = response.content[0]
          if (content.type !== "text") continue

          interface TreatmentResult {
            index: number
            applies_to: string[]
          }

          const assignments = parseClaudeJson<TreatmentResult[]>(content.text)
          if (!assignments || !Array.isArray(assignments)) continue

          for (const assignment of assignments) {
            const rule = batch[assignment.index]
            if (!rule || !assignment.applies_to || assignment.applies_to.length === 0) continue

            // Validate treatment types
            const validTreatments = [
              "stem_cell",
              "prp",
              "exosomes",
              "bmac",
              "whartons_jelly",
              "prolotherapy",
              "peptide",
              "iv_therapy",
              "hormone_therapy",
            ]
            const filtered = assignment.applies_to.filter((t) => validTreatments.includes(t))
            if (filtered.length === 0) continue

            const { error } = await supabase
              .from("compliance_rules")
              .update({
                applies_to: filtered,
                updated_at: new Date().toISOString(),
              })
              .eq("id", rule.id)

            if (!error) {
              metrics.treatments_assigned++
            }
          }
        } catch (e) {
          console.error(`[deep-scrape] Treatment assignment batch error:`, e)
        }
      }
    }
  } catch (e) {
    console.error("[deep-scrape] Treatment assignment failed:", e)
  }

  // =========================================================================
  // 6. Feed Content Generation — SKIPPED
  // ComplianceRule type has no title/description columns.
  // Feed content can be generated from banned_phrase + source_name.
  // =========================================================================

  // =========================================================================
  // 7. Notification
  // =========================================================================

  metrics.duration_ms = Date.now() - startTime

  try {
    const parts: string[] = []
    if (metrics.new_rules > 0) parts.push(`${metrics.new_rules} new rule(s) added`)
    if (metrics.rules_improved > 0) parts.push(`${metrics.rules_improved} rule(s) improved`)
    if (metrics.duplicates_removed > 0)
      parts.push(`${metrics.duplicates_removed} duplicate(s) removed`)
    if (metrics.treatments_assigned > 0)
      parts.push(`${metrics.treatments_assigned} rule(s) assigned treatments`)

    const summary =
      parts.length > 0 ? parts.join(", ") : "No changes needed — library is up to date"

    await createBroadcastNotification(
      "Monthly Deep Scrape Complete",
      `Monthly compliance review finished in ${Math.round(metrics.duration_ms / 1000)}s. ${summary}.`,
      "rule_update",
      "/dashboard/library",
    )
  } catch (e) {
    console.error("[deep-scrape] Notification error:", e)
  }

  // =========================================================================
  // 8. Response
  // =========================================================================

  console.log(
    `[deep-scrape] Complete: ${metrics.new_rules} new, ${metrics.rules_improved} improved, ${metrics.duplicates_removed} deduped, ${metrics.treatments_assigned} treatments in ${metrics.duration_ms}ms`,
  )

  return NextResponse.json({
    success: true,
    metrics,
  })
}
