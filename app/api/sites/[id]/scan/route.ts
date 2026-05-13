export const maxDuration = 300

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { requireWriteMode } from "@/lib/impersonation"
import { checkRateLimit } from "@/lib/rate-limit"
import { createUserNotification } from "@/lib/notifications"
import { isValidUUID } from "@/lib/validations"
import { scanSitePages, type RuleForPrompt } from "@/lib/scan/run-site-crawl"
import { getActiveComplianceRules } from "@/lib/compliance-rules-cache"
import { getMonitoredSite } from "@/lib/repos/monitored-sites"
import { getProfile } from "@/lib/repos/profiles"

const MAX_PAGES_PER_CRAWL = 20

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid site ID" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blocked = await requireWriteMode()
    if (blocked) return blocked

    // Rate-limit key is scoped to (user, site) so an attacker who learns
    // a site UUID can't burn through another tenant's daily crawl quota.
    // The user.id prefix also doubles as a write-attribution check; only
    // the owning user can hit the limit for their own sites.
    const { allowed } = await checkRateLimit(`crawl:${user.id}:${id}`, 3, 24 * 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json({ error: "Rate limit exceeded. Maximum 3 crawls per site per day." }, { status: 429 })
    }

    // Per-user daily cap. The previous version of this route lacked it,
    // so a single user could fan out to MAX_PAGES * MAX_SITES Anthropic
    // calls per day - parity with sites/[id]/crawl now.
    const { allowed: userAllowed } = await checkRateLimit(`crawl-user:${user.id}`, 10, 24 * 60 * 60 * 1000)
    if (!userAllowed) {
      return NextResponse.json({ error: "Daily crawl limit exceeded. Maximum 10 crawls per day across all sites." }, { status: 429 })
    }

    const profileId = await effectiveProfileId(user.id, supabase)

    const profile = await getProfile(supabase, profileId)

    if (!profile || !["active", "past_due"].includes(profile.subscription_status ?? "")) {
      return NextResponse.json({ error: "Active subscription required" }, { status: 403 })
    }

    const site = await getMonitoredSite(supabase, profileId, id)
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    const rules = await getActiveComplianceRules(supabase)

    // Coerce DB nulls to RuleForPrompt's non-nullable shape. variants and
    // applies_to default to '{}' in schema but tsc treats text[] as nullable.
    const rulesForPrompt: RuleForPrompt[] = rules.map((r) => ({
      id: r.id,
      phrase: r.banned_phrase,
      variants: r.banned_phrase_variants ?? [],
      alt: r.compliant_alternative ?? "",
      risk: r.risk_level,
      cat: r.category ?? "general",
    }))

    const result = await scanSitePages(supabase, {
      site: { id: site.id, domain: site.domain, profile_id: site.profile_id },
      rulesForPrompt,
      treatments: profile.treatments ?? [],
      profileId,
      maxPages: MAX_PAGES_PER_CRAWL,
      source: "sites/scan",
    })

    await createUserNotification(
      profileId,
      `Site scan complete: ${site.domain}`,
      `Average score: ${result.avgScore ?? "N/A"}/100, ${result.scannedCount} pages scanned${result.failedCount > 0 ? `, ${result.failedCount} failed` : ""}`,
      "site_scan",
      `/dashboard/sites/${site.id}`,
    )

    return NextResponse.json({
      success: true,
      site_id: site.id,
      domain: site.domain,
      pages_scanned: result.scannedCount,
      pages_failed: result.failedCount,
      pages_queued: result.overflowCount,
      avg_compliance_score: result.avgScore,
    })
  } catch (error) {
    console.error("Crawl error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
