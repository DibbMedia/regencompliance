export const maxDuration = 300

import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { createUserNotification } from "@/lib/notifications"
import { isCronAuthorized } from "@/lib/cron-auth"
import { scanSitePages, type RuleForPrompt } from "@/lib/scan/run-site-crawl"

const MAX_SITES_PER_RUN = 10
const MAX_PAGES_PER_SITE = 20

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (!isCronAuthorized(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const startTime = Date.now()
  const supabase = createServiceClient()

  const { data: sites, error: sitesError } = await supabase
    .from("monitored_sites")
    .select("*, profiles!inner(treatments)")
    .eq("is_active", true)
    .lte("next_crawl_at", new Date().toISOString())
    .order("next_crawl_at", { ascending: true })
    .limit(MAX_SITES_PER_RUN)

  if (sitesError) {
    console.error("Failed to fetch sites for monitoring:", sitesError)
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 })
  }

  if (!sites || sites.length === 0) {
    return NextResponse.json({
      success: true,
      message: "No sites due for monitoring",
      sites_processed: 0,
      duration_ms: Date.now() - startTime,
    })
  }

  // Fetch compliance rules once for all sites
  const { data: rules } = await supabase
    .from("compliance_rules")
    .select("id, banned_phrase, banned_phrase_variants, compliant_alternative, risk_level, applies_to, category")
    .eq("is_active", true)

  const rulesForPrompt: RuleForPrompt[] = (rules || []).map((r) => ({
    id: r.id,
    phrase: r.banned_phrase,
    variants: r.banned_phrase_variants,
    alt: r.compliant_alternative,
    risk: r.risk_level,
    cat: r.category,
  }))

  const siteResults: Array<{
    domain: string
    pages_scanned: number
    pages_failed: number
    avg_score: number | null
    alerts: string[]
  }> = []

  for (const site of sites) {
    const treatments = (site.profiles as { treatments?: string[] })?.treatments ?? []

    const result = await scanSitePages(supabase, {
      site: { id: site.id, domain: site.domain, profile_id: site.profile_id },
      rulesForPrompt,
      treatments,
      profileId: site.profile_id,
      maxPages: MAX_PAGES_PER_SITE,
      source: "cron/site-monitor",
      // Cron-specific: emit a per-page urgent notification when score < 50.
      // The shared loop calls back here while the page is fresh in scope.
      onLowScore: async (page, score) => {
        await createUserNotification(
          site.profile_id,
          `Compliance alert: ${page.url}`,
          `This page scored ${score}/100 during weekly monitoring. Immediate review recommended.`,
          "compliance_alert",
          `/dashboard/sites/${site.id}`,
        )
      },
    })

    await createUserNotification(
      site.profile_id,
      `Weekly compliance scan: ${site.domain}`,
      `Score: ${result.avgScore ?? "N/A"}/100, ${result.scannedCount} pages scanned${result.lowScorePages.length > 0 ? `, ${result.lowScorePages.length} pages below 50` : ""}`,
      "weekly_scan",
      `/dashboard/sites/${site.id}`,
    )

    siteResults.push({
      domain: site.domain,
      pages_scanned: result.scannedCount,
      pages_failed: result.failedCount,
      avg_score: result.avgScore,
      alerts: result.lowScorePages,
    })
  }

  const duration = Date.now() - startTime
  console.log(`Site monitor cron complete: ${siteResults.length} sites processed in ${duration}ms`)

  return NextResponse.json({
    success: true,
    sites_processed: siteResults.length,
    results: siteResults,
    duration_ms: duration,
  })
}
