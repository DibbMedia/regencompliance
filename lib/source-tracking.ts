// Lightweight UTM/source attribution for public lead-capture routes.
// Parses utm_source / utm_campaign / utm_medium from the Referer header's
// query string and returns a single short string suitable for a `source`
// column. Falls back to "website" when no UTM is present and to "direct"
// when there's no Referer at all (reflects organic, bookmark, or direct
// traffic versus a referral from our own marketing).

const FALLBACK_REFERRED = "website"
const FALLBACK_DIRECT = "direct"

export function deriveSource(request: Request): string {
  const referer = request.headers.get("referer")
  if (!referer) return FALLBACK_DIRECT

  try {
    const url = new URL(referer)
    const utmSource = url.searchParams.get("utm_source")?.trim()
    const utmCampaign = url.searchParams.get("utm_campaign")?.trim()
    const utmMedium = url.searchParams.get("utm_medium")?.trim()

    // Prefer the most specific signal: campaign > source > medium.
    // Trim each to 64 chars so a hostile querystring can't bloat the column.
    const pick = (utmCampaign || utmSource || utmMedium || "").slice(0, 64)
    if (pick) return pick

    return FALLBACK_REFERRED
  } catch {
    return FALLBACK_REFERRED
  }
}
