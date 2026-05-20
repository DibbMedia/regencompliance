// Generic state-level enforcement-source scraper.
//
// Reuses lib/compliance-scraper.ts:safeFetchHtml so the SSRF guards
// (assertSafeUrl + pinnedFetch) and the 2 MB response cap apply uniformly
// across all state and federal scrapers. Do NOT add a parallel fetcher.
//
// Behavior:
// - scrapeStateSource short-circuits any source whose status != "implemented"
//   and returns "skipped_scaffolded". No network call happens.
// - For implemented sources, fetches the listing URL via safeFetchHtml,
//   parses with cheerio, runs listSelector, and returns up to MAX_LINKS
//   absolute candidate URLs + their anchor text. Errors are caught and
//   surfaced via result.error - this function never throws.
// - scrapeAllImplementedStates iterates the registry sequentially (hostile
//   state-government sites can rate-limit harder than the FDA; we're not
//   in a hurry and the cron runs weekly).
//
// Logging follows the F-09 sampled pattern from lib/scan/run-site-crawl.ts:
// first hit always logs, then every Nth, with a running counter attached so
// noisy weeks remain diagnosable without spamming the cron logs.

import * as cheerio from "cheerio"
import { safeFetchHtml } from "@/lib/compliance-scraper"
import { STATE_SOURCES, type StateSource } from "@/lib/compliance/state-sources"

const FETCH_TIMEOUT_MS = 15_000
const MAX_LINKS = 50

export interface StateScrapeResult {
  source: StateSource
  status: "ok" | "skipped_scaffolded" | "fetch_failed" | "parse_failed" | "empty"
  links: { url: string; title: string }[]
  error?: string
}

// Sampled-logging counters. First success/skip logs unconditionally; the
// rest log every Nth. Same shape as F-09 in run-site-crawl.ts.
let successLogCount = 0
let skipLogCount = 0
const SUCCESS_LOG_SAMPLE = 10
const SKIP_LOG_SAMPLE = 25

function logSuccess(source: StateSource, linkCount: number): void {
  successLogCount++
  if (successLogCount === 1 || successLogCount % SUCCESS_LOG_SAMPLE === 0) {
    console.info(
      "[state-scraper] ok " + source.state + " " + source.kind +
        " links=" + linkCount + " (total successes since start: " + successLogCount + ")",
    )
  }
}

function logSkip(source: StateSource): void {
  skipLogCount++
  if (skipLogCount === 1 || skipLogCount % SKIP_LOG_SAMPLE === 0) {
    console.info(
      "[state-scraper] skipped scaffolded " + source.state + " " + source.kind +
        " (total skips since start: " + skipLogCount + ")",
    )
  }
}

export async function scrapeStateSource(source: StateSource): Promise<StateScrapeResult> {
  if (source.status !== "implemented") {
    logSkip(source)
    return { source, status: "skipped_scaffolded", links: [] }
  }

  if (!source.listSelector) {
    // An "implemented" source missing a listSelector is a config bug, not a
    // runtime failure. The registry test asserts every implemented entry has
    // a selector, so this path should be unreachable in practice; we still
    // guard rather than throw because the cron must keep going.
    return {
      source,
      status: "parse_failed",
      links: [],
      error: "implemented source missing listSelector",
    }
  }

  let html: string | null
  try {
    html = await safeFetchHtml(source.url, FETCH_TIMEOUT_MS)
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    console.error("[state-scraper] fetch threw for " + source.state + ": " + reason)
    return { source, status: "fetch_failed", links: [], error: reason }
  }

  if (!html) {
    return { source, status: "fetch_failed", links: [], error: "safeFetchHtml returned null" }
  }

  let $: cheerio.CheerioAPI
  try {
    $ = cheerio.load(html)
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    return { source, status: "parse_failed", links: [], error: reason }
  }

  const attr = source.linkAttr ?? "href"
  const links: { url: string; title: string }[] = []
  const seen = new Set<string>()

  try {
    $(source.listSelector).each((_i, el) => {
      if (links.length >= MAX_LINKS) return false

      const raw = $(el).attr(attr)
      if (!raw) return

      // Resolve against listing URL so relative hrefs become absolute.
      let absolute: string
      try {
        absolute = new URL(raw, source.url).toString()
      } catch {
        return
      }

      // Reject non-http(s) hrefs (mailto:, javascript:, tel:, data:, etc.).
      if (!absolute.startsWith("http://") && !absolute.startsWith("https://")) return

      if (seen.has(absolute)) return
      seen.add(absolute)

      const title = $(el).text().replace(/\s+/g, " ").trim() || absolute
      links.push({ url: absolute, title })
    })
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    return { source, status: "parse_failed", links: [], error: reason }
  }

  if (links.length === 0) {
    return { source, status: "empty", links: [] }
  }

  logSuccess(source, links.length)
  return { source, status: "ok", links }
}

export async function scrapeAllImplementedStates(): Promise<StateScrapeResult[]> {
  const results: StateScrapeResult[] = []
  for (const source of STATE_SOURCES) {
    const result = await scrapeStateSource(source)
    results.push(result)
  }
  return results
}
