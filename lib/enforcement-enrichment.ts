import type { SupabaseClient } from "@supabase/supabase-js"
import {
  extractArticleText,
  extractActionMetadata,
  synthesizeSummaryFromRules,
  COMPLIANCE_SOURCES,
} from "@/lib/compliance-scraper"

export interface EnrichResult {
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

export async function enrichActions(
  serviceClient: SupabaseClient,
  limit: number,
): Promise<{ counts: Record<string, number>; results: EnrichResult[] }> {
  const { data: actions, error } = await serviceClient
    .from("enforcement_actions")
    .select("id, source_url, source_type, source_name, agency, company_name, product_or_treatment")
    .is("summary", null)
    .order("source_date", { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to query actions: ${error.message}`)
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

  return { counts, results }
}
