import type { ScanFlag } from "@/lib/types"

export interface PhiDetection {
  detected: boolean
  patterns: string[]
}

const PHI_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: "SSN", re: /\b\d{3}-\d{2}-\d{4}\b/ },
  { name: "DOB", re: /\b(DOB|Date of Birth)\s*[:\-]/i },
  { name: "MRN", re: /\b(MRN|Medical Record Number|Patient ID)\s*[:\-#]/i },
  { name: "Patient label", re: /\bPatient\s*(Name|#|Number)\s*[:\-]/i },
  { name: "Phone (labeled)", re: /\b(Phone|Tel|Mobile)\s*[:\-]\s*\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}\b/i },
  // ICD-10 codes are A00-T98 / V01-Y98 / Z00-Z99 etc with an optional decimal
  // sub-classification. Pre-2026-05-05 the regex matched any 3-char token like
  // B12, A1B, C3A which produced false positives on vitamin / drug names in
  // marketing copy. Now require a labelling cue ("ICD-10", "diagnosis code"
  // etc) or the colon/dash form in front of the code so we don't flag normal
  // healthcare marketing text.
  {
    name: "ICD-10",
    re: /\b(?:ICD[-\s]?10|diagnosis\s+code|dx\s*code)\b\s*[:#-]?\s*[A-TV-Z][0-9][0-9AB](?:\.[0-9A-TV-Z]{1,4})?\b/i,
  },
  { name: "NPI", re: /\b(NPI|National Provider Identifier)\s*[:\-]?\s*\d{10}\b/i },
  { name: "Insurance ID", re: /\b(Policy|Member|Subscriber)\s*(ID|#|Number)\s*[:\-]/i },
]

export function detectPhi(text: string): PhiDetection {
  if (!text) return { detected: false, patterns: [] }
  const hits: string[] = []
  for (const { name, re } of PHI_PATTERNS) {
    if (re.test(text)) hits.push(name)
  }
  return { detected: hits.length > 0, patterns: hits }
}

export const PHI_ERROR_MESSAGE =
  "Your content looks like it contains patient information (PHI). For safety, we block these patterns. Please only scan marketing materials - remove patient names, DOB, MRN, SSN, or insurance identifiers before scanning."

// ---------------------------------------------------------------------------
// Output-side scrubber (added 2026-05-20)
//
// `detectPhi` above is the INPUT-side gate. Its regexes are intentionally
// optimised for "did the user ASK us to scan PHI?" - many of them match only
// the LABEL ("DOB:", "MRN -", "Patient Name:") and don't care about the value
// because the user shouldn't be sending any of that on the way IN.
//
// Output-side is different. By the time Claude has quoted a clinic's website
// back at us, the LABEL alone isn't useful to redact - we need to scrub the
// LABEL + the value that follows it (the actual DOB digits, the MRN number,
// the patient name token) so a downstream operator reading the scans row
// can't reconstruct the PHI. PHI_REDACT_PATTERNS therefore mirrors the input
// list but each labelled pattern is extended with `\s*\S+(?:\s+\S+){0,2}` or
// similar to capture the value that immediately follows the label, and every
// regex carries the global flag so `String.prototype.replace` removes EVERY
// occurrence in one pass (not just the first).
//
// `name` values are kept identical to PHI_PATTERNS so the audit-log warn and
// the `hits` array shape stay stable across input + output gates.
// ---------------------------------------------------------------------------
// Each value matcher is intentionally CONSERVATIVE about how far past the
// label it consumes. Earlier broader patterns (e.g. "LABEL + next 3 tokens")
// caused DOB to swallow a following "MRN: 99887" because the comma and
// slash separators didn't terminate the run, hiding the MRN label from the
// MRN regex. The current per-pattern shapes stop at commas, periods,
// semicolons, end-of-line, and end-of-string so multi-PHI bursts like
// "DOB: 05/06/1972, MRN # 7777" fire BOTH the DOB and the MRN matchers.
//
// Each value tolerates a small set of date-shape punctuation (`/`, `-`,
// `.`) so "DOB: 01/02/1980" and "DOB: 01-02-1980" both fully redact;
// names allow letters + apostrophe + dash so "Patient Name: O'Connor-Lee"
// stays redacted.
const PHI_REDACT_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: "SSN", re: /\b\d{3}-\d{2}-\d{4}\b/g },
  // DOB value: a date-shaped token (digits + / or -) OR up to 3 word
  // tokens for "January 2 1980" style. STOPS at comma/period/semicolon
  // so a chained "DOB: x, MRN: y" leaves the MRN intact.
  {
    name: "DOB",
    re: /\b(?:DOB|Date of Birth)\s*[:\-]\s*(?:[\d/.\-]+|[A-Za-z]+(?:\s+\d{1,2})?(?:\s+\d{2,4})?)/gi,
  },
  // MRN / Patient ID value: a single non-whitespace, non-separator token.
  { name: "MRN", re: /\b(?:MRN|Medical Record Number|Patient ID)\s*[:\-#]\s*[^\s,.;]+/gi },
  // Patient label value: up to 3 word-tokens (allowing apostrophes,
  // hyphens, periods inside e.g. "Dr." or "J.R."). Stops at comma /
  // semicolon for the same chaining reason.
  {
    name: "Patient label",
    re: /\bPatient\s*(?:Name|#|Number)\s*[:\-]\s*[A-Za-z][A-Za-z'\-.]*(?:\s+[A-Za-z][A-Za-z'\-.]*){0,2}/gi,
  },
  { name: "Phone (labeled)", re: /\b(?:Phone|Tel|Mobile)\s*[:\-]\s*\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}\b/gi },
  {
    name: "ICD-10",
    re: /\b(?:ICD[-\s]?10|diagnosis\s+code|dx\s*code)\b\s*[:#-]?\s*[A-TV-Z][0-9][0-9AB](?:\.[0-9A-TV-Z]{1,4})?\b/gi,
  },
  { name: "NPI", re: /\b(?:NPI|National Provider Identifier)\s*[:\-]?\s*\d{10}\b/gi },
  { name: "Insurance ID", re: /\b(?:Policy|Member|Subscriber)\s*(?:ID|#|Number)\s*[:\-]\s*[^\s,.;]+/gi },
]

// Clone the regex per call. Global regexes carry lastIndex state across
// successive .test() / .replace() calls which can cause off-by-one false
// negatives when the same RegExp object is reused on consecutive strings.
function freshPattern(re: RegExp): RegExp {
  return new RegExp(re.source, re.flags)
}

export interface PhiRedactionResult {
  hadHits: boolean
  hits: string[]              // pattern names that fired
  cleanedText: string         // text with hits replaced by [REDACTED-{pattern}]
  cleanedFlags?: ScanFlag[]   // flags with matched_text passed through cleanedText
}

// Input flag shape - intentionally minimal so concrete types like ScanFlag
// (lib/types.ts) and per-route RawFlag locals (e.g. app/api/free-audit) BOTH
// structurally satisfy it without needing the `[k: string]: unknown` index
// signature that initially appeared on the contract. An index signature
// constrains EVERY property to its value type, which clashes with literal
// unions like `risk_level: 'high' | 'medium' | 'low'` on ScanFlag. The
// {matched_text?, context?} shape is wide enough that excess properties on
// caller objects are simply preserved through the spread in the .map below.
// `context` is included so the scrubber can inspect it without an `as any`.
type RedactInputFlag = { matched_text?: string; context?: string }

/**
 * Replace every PHI match in `text` with the sentinel `[REDACTED-{name}]`.
 *
 * Placeholder format is `[REDACTED-{name}]` (a single contiguous bracketed
 * token, no whitespace inside the brackets) where `{name}` is the
 * PHI_REDACT_PATTERNS entry's `name` (e.g. `[REDACTED-SSN]`,
 * `[REDACTED-DOB]`). The placeholder is intentionally compact so:
 *
 *   - Downstream char-offset features see a deterministic, contiguous
 *     replacement (length = `"[REDACTED-".length + name.length + 1`)
 *     instead of a multi-line scrub that would shift offsets unpredictably.
 *   - Operators grepping the scans DB can search the canonical placeholder
 *     to confirm what redaction fired without leaking the underlying PHI.
 *   - The placeholder itself cannot re-match any PHI_REDACT_PATTERNS regex
 *     (none of them match the literal "[REDACTED-..."), so a second pass
 *     through the same redactor is a no-op (idempotent).
 */
function redactString(text: string): { cleaned: string; hits: Set<string> } {
  const hits = new Set<string>()
  let cleaned = text
  for (const { name, re } of PHI_REDACT_PATTERNS) {
    if (freshPattern(re).test(cleaned)) {
      hits.add(name)
      cleaned = cleaned.replace(freshPattern(re), `[REDACTED-${name}]`)
    }
  }
  return { cleaned, hits }
}

/**
 * Output-side scrubber. Walks each flag's matched_text + the top-level
 * summary, returns redacted versions plus a list of hits. The caller
 * decides whether to persist the cleaned form (recommended) or block
 * the entire scan.
 *
 * Replacement format: every match is swapped for the literal
 * `[REDACTED-{patternName}]` token (single contiguous bracketed string,
 * see `redactString` doc above for the rationale). Length is compact and
 * deterministic so any downstream char-offset feature can re-derive
 * offsets if needed; the placeholder cannot re-trigger any
 * PHI_REDACT_PATTERNS regex on a second pass.
 *
 * `cleanedFlags` is returned only when the caller passed `flags`. The
 * `matched_text` field is overwritten with its cleaned form; `context`
 * (which can also leak the surrounding sentence) is scrubbed too because
 * we already have the redactor in hand. All other flag fields
 * (rule_id, banned_phrase, risk_level, reason, alternative, element_type)
 * pass through unchanged. If a non-string `matched_text` slipped in via
 * Claude (defensive: the JSON contract says string), it is coerced to an
 * empty string in the cleaned output.
 */
export function redactPhiInOutput(input: {
  summary?: string | null
  flags?: RedactInputFlag[]
}): PhiRedactionResult {
  const allHits = new Set<string>()

  // Summary pass.
  let cleanedSummary = ""
  if (typeof input.summary === "string" && input.summary.length > 0) {
    const { cleaned, hits } = redactString(input.summary)
    cleanedSummary = cleaned
    for (const h of hits) allHits.add(h)
  }

  // Per-flag pass. We rebuild each flag rather than mutate so the
  // caller's array isn't aliased. matched_text is the primary PHI-bearing
  // field; context is the surrounding sentence which can also leak PHI
  // verbatim, so it gets scrubbed in the same pass.
  let cleanedFlags: ScanFlag[] | undefined
  if (Array.isArray(input.flags)) {
    cleanedFlags = input.flags.map((f) => {
      const rawMatched = typeof f.matched_text === "string" ? f.matched_text : ""
      const matchedResult = redactString(rawMatched)
      for (const h of matchedResult.hits) allHits.add(h)

      const rawContext = typeof f.context === "string" ? f.context : undefined
      let cleanedContext = rawContext
      if (typeof rawContext === "string" && rawContext.length > 0) {
        const ctxResult = redactString(rawContext)
        cleanedContext = ctxResult.cleaned
        for (const h of ctxResult.hits) allHits.add(h)
      }

      // Spread original flag fields so unknown extras (e.g. future
      // additions to ScanFlag) survive; then overwrite the scrubbed
      // fields. Cast to ScanFlag for the return type since the caller's
      // input array is loosely typed.
      const out = { ...f, matched_text: matchedResult.cleaned } as ScanFlag
      if (cleanedContext !== undefined) {
        out.context = cleanedContext
      }
      return out
    })
  }

  return {
    hadHits: allHits.size > 0,
    hits: Array.from(allHits),
    cleanedText: cleanedSummary,
    cleanedFlags,
  }
}
