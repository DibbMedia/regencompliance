export const maxDuration = 300

import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import {
  extractArticleText,
  extractActionMetadata,
  synthesizeSummaryFromRules,
  COMPLIANCE_SOURCES,
} from "@/lib/compliance-scraper"

interface EnrichResult {
  id: string
  source_url: string
  status:
    | "enriched_from_source"
    | "enriched_from_rules"
    | "skipped"
    | "fetch_failed"
    | "extract_failed"
    | "update_failed"
  reason?: string
}

function isGenericListingUrl(url: string): boolean {
  return (
    url.endsWith("/warning-letters") ||
    url.endsWith("/press-releases") ||
    url.endsWith("/health-claims") ||
    url.endsWith("/inspections-observations") ||
    url.endsWith("/health-care-fraud")
  )
}

/**
 * One-time backfill: enrich enforcement_actions whose summary is NULL.
 *
 * Strategy:
 *   1. If source URL points at a specific letter/release: fetch it and extract
 *      company/product/summary from the actual document text.
 *   2. If the URL is a generic listing page (or fetch fails): fall back to
 *      synthesizing a summary from the nested rules data so every row has text.
 */
export async function POST(request: Request) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error
  const { serviceClient } = auth

  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50)

  const { data: actions, error } = await serviceClient
    .from("enforcement_actions")
    .select("id, source_url, source_type, source_name, agency, company_name, product_or_treatment")
    .is("summary", null)
    .order("source_date", { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: "Failed to query actions" }, { status: 500 })
  }

  const results: EnrichResult[] = []

  for (const action of actions ?? []) {
    const source = COMPLIANCE_SOURCES.find(
      (s) => s.type === action.source_type || s.name === action.source_name,
    )
    const contentSelector = source?.contentSelector ?? "article, .field--name-body, main"

    let companyName = action.company_name as string | null
    let productOrTreatment = action.product_or_treatment as string | null
    let summary: string | null = null
    let status: EnrichResult["status"] = "extract_failed"

    // Path 1: specific URL → fetch the actual document
    if (!isGenericListingUrl(action.source_url)) {
      const articleText = await extractArticleText(action.source_url, contentSelector)
      if (articleText) {
        const metadata = await extractActionMetadata(articleText, action.source_name)
        if (metadata) {
          companyName = companyName ?? metadata.company_name
          productOrTreatment = productOrTreatment ?? metadata.product_or_treatment
          summary = metadata.summary
          status = "enriched_from_source"
        }
      }
    }

    // Path 2: generic URL or fetch failed → synthesize from linked rules
    if (!summary) {
      const { data: rules } = await serviceClient
        .from("compliance_rules")
        .select("banned_phrase, compliant_alternative, category, risk_level, applies_to")
        .eq("enforcement_action_id", action.id)
        .eq("is_active", true)

      if (rules && rules.length > 0) {
        summary = await synthesizeSummaryFromRules(
          companyName,
          productOrTreatment,
          action.agency as string | null,
          action.source_name,
          rules,
        )
        if (summary) status = "enriched_from_rules"
      } else {
        results.push({
          id: action.id,
          source_url: action.source_url,
          status: "skipped",
          reason: "no rules linked and source URL is a listing page",
        })
        continue
      }
    }

    if (!summary) {
      results.push({
        id: action.id,
        source_url: action.source_url,
        status: isGenericListingUrl(action.source_url) ? "extract_failed" : "fetch_failed",
      })
      continue
    }

    const { error: updateErr } = await serviceClient
      .from("enforcement_actions")
      .update({
        company_name: companyName,
        product_or_treatment: productOrTreatment,
        summary,
      })
      .eq("id", action.id)

    if (updateErr) {
      results.push({ id: action.id, source_url: action.source_url, status: "update_failed" })
      continue
    }

    results.push({ id: action.id, source_url: action.source_url, status })
  }

  const counts = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  return NextResponse.json({ counts, results })
}
