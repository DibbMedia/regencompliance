// Lightweight UTM/source attribution for public lead-capture routes.
// Parses utm_source / utm_campaign / utm_medium from the Referer header's
// query string and returns a single short string suitable for a `source`
// column. Falls back to "website" when no UTM is present or no Referer is
// available (organic, bookmark, paste, or test environment).

const FALLBACK = "website"

export function deriveSource(request: Request): string {
  const referer = request.headers.get("referer")
  if (!referer) return FALLBACK

  try {
    const url = new URL(referer)
    const utmSource = url.searchParams.get("utm_source")?.trim()
    const utmCampaign = url.searchParams.get("utm_campaign")?.trim()
    const utmMedium = url.searchParams.get("utm_medium")?.trim()

    // Prefer the most specific signal: campaign > source > medium.
    // Trim each to 64 chars so a hostile querystring can't bloat the column.
    const pick = (utmCampaign || utmSource || utmMedium || "").slice(0, 64)
    if (pick) return pick

    return FALLBACK
  } catch {
    return FALLBACK
  }
}
