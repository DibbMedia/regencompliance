// Build a Chrome text-fragment URL that jumps to a phrase on the live page.
// Text fragments (#:~:text=) require an EXACT substring match in the rendered DOM,
// but our matched_text comes from cheerio-stripped page text — whitespace, punctuation,
// and entity differences silently break the match. We build a short, cleaned anchor
// to maximize the hit rate across sites.
export function buildTextFragmentUrl(
  sourceUrl: string,
  matchedText: string,
  bannedPhrase?: string
): string {
  if (!sourceUrl) return sourceUrl

  // Prefer matched_text (it's what Claude saw on the page). Fall back to banned_phrase.
  const raw = (matchedText || bannedPhrase || "").toString()

  const anchor = raw
    .replace(/[\u00A0\u2009\u202F\s]+/g, " ")    // collapse any whitespace incl. &nbsp;
    .replace(/[""'']/g, "")                      // strip smart quotes (often differ DOM vs text)
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "") // strip leading/trailing punctuation
    .trim()
    .split(" ")
    .slice(0, 8)                                 // first 8 words — shorter = more likely to match
    .join(" ")

  if (!anchor) return sourceUrl
  return `${sourceUrl}#:~:text=${encodeURIComponent(anchor)}`
}
