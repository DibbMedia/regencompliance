export const maxDuration = 300

import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { createUserNotification } from "@/lib/notifications"
import { isCronAuthorized } from "@/lib/cron-auth"
import { scanSitePages, type RuleForPrompt } from "@/lib/scan/run-site-crawl"
import { listMonitoredSitesForCron } from "@/lib/repos/monitored-sites"
import { getProfile } from "@/lib/repos/profiles"
import { withCryptoRequestScope } from "@/lib/crypto"

const MAX_SITES_PER_RUN = 10
const MAX_PAGES_PER_SITE = 20

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (!isCronAuthorized(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const startTime = Date.now()
  const supabase = createServiceClient()

  // Two-step lookup: get sites due for crawl (decrypted), then resolve
  // each owner's encrypted profile for treatments. The legacy
  // `.select("*, profiles!inner(treatments)")` JOIN doesn't work
  // post-encryption because profiles.treatments is now a v1u. envelope.
  let sites
  try {
    sites = await listMonitoredSitesForCron(supabase, { limit: MAX_SITES_PER_RUN })
  } catch (sitesError) {
    console.error("Failed to fetch sites for monitoring:", sitesError)
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 })
  }

  if (sites.length === 0) {
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
    // Per-site request scope so the HKDF derivation + decryptions get
    // cached together for this site's profile DEK.
    const result = await withCryptoRequestScope(async () => {
      const profile = await getProfile(supabase, site.profile_id)
      const treatments = profile?.treatments ?? []

      const inner = await scanSitePages(supabase, {
        site: { id: site.id, domain: site.domain, profile_id: site.profile_id },
        rulesForPrompt,
        treatments,
        profileId: site.profile_id,
        maxPages: MAX_PAGES_PER_SITE,
        source: "cron/site-monitor",
        // Per-page hook fires while the page is still in scope; alert
        // copy stays plaintext but the page URL it embeds is already
        // decrypted by scanSitePages before this hook is called.
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
        `Score: ${inner.avgScore ?? "N/A"}/100, ${inner.scannedCount} pages scanned${inner.lowScorePages.length > 0 ? `, ${inner.lowScorePages.length} pages below 50` : ""}`,
        "weekly_scan",
        `/dashboard/sites/${site.id}`,
      )

      return inner
    })

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
