export const maxDuration = 300

import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import {
  extractArticleText,
  extractActionMetadata,
  COMPLIANCE_SOURCES,
} from "@/lib/compliance-scraper"

interface EnrichResult {
  id: string
  source_url: string
  status: "enriched" | "skipped" | "fetch_failed" | "extract_failed" | "update_failed"
  reason?: string
}

/**
 * One-time backfill: enrich enforcement_actions whose summary is NULL by
 * re-fetching the source URL and running extractActionMetadata. Skips actions
 * whose source URL is a generic listing page (no per-letter content to summarize).
 */
export async function POST(request: Request) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error
  const { serviceClient } = auth

  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50)

  const { data: actions, error } = await serviceClient
    .from("enforcement_actions")
    .select("id, source_url, source_type, source_name")
    .is("summary", null)
    .order("source_date", { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: "Failed to query actions" }, { status: 500 })
  }

  const results: EnrichResult[] = []

  for (const action of actions ?? []) {
    // Skip generic listing URLs that don't represent a single document
    if (action.source_url.endsWith("/warning-letters") || action.source_url.endsWith("/press-releases")) {
      results.push({
        id: action.id,
        source_url: action.source_url,
        status: "skipped",
        reason: "generic listing URL",
      })
      continue
    }

    // Find the matching source config for content selectors
    const source = COMPLIANCE_SOURCES.find(
      (s) => s.type === action.source_type || s.name === action.source_name,
    )
    const contentSelector = source?.contentSelector ?? "article, .field--name-body, main"

    const articleText = await extractArticleText(action.source_url, contentSelector)
    if (!articleText) {
      results.push({ id: action.id, source_url: action.source_url, status: "fetch_failed" })
      continue
    }

    const metadata = await extractActionMetadata(articleText, action.source_name)
    if (!metadata) {
      results.push({ id: action.id, source_url: action.source_url, status: "extract_failed" })
      continue
    }

    const { error: updateErr } = await serviceClient
      .from("enforcement_actions")
      .update({
        company_name: metadata.company_name,
        product_or_treatment: metadata.product_or_treatment,
        summary: metadata.summary,
      })
      .eq("id", action.id)

    if (updateErr) {
      results.push({ id: action.id, source_url: action.source_url, status: "update_failed" })
      continue
    }

    results.push({ id: action.id, source_url: action.source_url, status: "enriched" })
  }

  const counts = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  return NextResponse.json({ counts, results })
}
