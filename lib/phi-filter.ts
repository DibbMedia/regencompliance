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

// ---------------------------------------------------------------------------
// BARE PHI patterns (added 2026-05-20)
//
// PHI_REDACT_PATTERNS above gate on a LABEL ("SSN:", "DOB -", "MRN #") so
// they don't false-positive on a clinic's "Founded in 1985" or its own
// office phone number. But a hostile / sloppy website can craft text like
//
//   "Patient born 1962-03-14, treated for back pain"
//
// which has no label and would slip past the gated patterns, getting
// echoed verbatim into the scans row + free-audit response. These
// label-less patterns catch HIGH-confidence PHI/PII shapes regardless of
// surrounding context.
//
// **False-positive policy (documented and accepted):**
// The clinic's own phone number, email address, or founding date COULD
// match these patterns. That's the tradeoff: this redactor runs on the
// OUTPUT side (Claude's summary + flag matched_text + flag context),
// where Claude's job is to FLAG / SUMMARIZE quoted text, not echo it.
// The scan result will already note the violation; the actual value
// being redacted (vs. quoted back) is a strict win for PHI safety.
//
// Year range on DOB-shaped patterns is intentionally tight (1900-2029)
// to avoid matching unrelated numeric strings like file paths or part
// numbers; "1899-01-01" or "12/31/2099" won't match.
// ---------------------------------------------------------------------------
const BARE_PHI_REDACT_PATTERNS: Array<{ name: string; re: RegExp; replace: string }> = [
  // SSN: ###-##-####. The label-gated PHI_REDACT_PATTERNS already
  // catches this exact regex with a non-global match - it's added here
  // again with the bare name so the hit list distinguishes the SOURCE
  // (a bare SSN with no "SSN:" prefix). Same replacement target.
  { name: "SSN-bare", re: /\b\d{3}-\d{2}-\d{4}\b/g, replace: "[REDACTED-SSN]" },

  // Phone numbers in common US formats: 555-123-4567, (555) 123-4567,
  // 555.123.4567, 5551234567. The clinic's own phone is the accepted
  // false-positive cost (see policy note above).
  {
    name: "Phone-bare",
    re: /\b\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}\b/g,
    replace: "[REDACTED-PHONE]",
  },

  // Email addresses. The clinic's contact email is the accepted
  // false-positive cost.
  {
    name: "Email-bare",
    re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    replace: "[REDACTED-EMAIL]",
  },

  // DOB-shaped values in YYYY-MM-DD form. Year range 1900-2029,
  // month 01-12, day 01-31. Anchored to word boundaries so it doesn't
  // bleed into adjacent digits / hyphens.
  {
    name: "DOB-bare-iso",
    re: /\b(?:19[0-9][0-9]|20[0-2][0-9])-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])\b/g,
    replace: "[REDACTED-DOB]",
  },

  // DOB-shaped values in US M/D/YYYY form. Same year range; month
  // 1-12 with optional leading zero; day 1-31 with optional leading
  // zero. Will catch "03/14/1985" but not bare 4-digit "1985".
  {
    name: "DOB-bare-us",
    re: /\b(?:0?[1-9]|1[0-2])\/(?:0?[1-9]|[12]\d|3[01])\/(?:19[0-9][0-9]|20[0-2][0-9])\b/g,
    replace: "[REDACTED-DOB]",
  },

  // MRN-shaped values: 6+ digit numbers preceded by a "#" (the bare-#
  // variant of the labeled MRN above). The preceding \W is captured
  // so we can put it back; otherwise the replace would eat the space
  // / start-of-line and produce weirdly-mashed cleaned text.
  {
    name: "MRN-bare-hash",
    re: /(^|\W)#\s*\d{6,}(?=\W|$)/g,
    replace: "$1[REDACTED-MRN]",
  },
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
 *
 * Two passes run in sequence:
 *   1. **Labeled patterns** (`PHI_REDACT_PATTERNS`) - mirror the input-side
 *      detectPhi gate. Use the canonical name in the placeholder
 *      (e.g. `[REDACTED-SSN]`).
 *   2. **Bare patterns** (`BARE_PHI_REDACT_PATTERNS`) - label-less,
 *      high-confidence PHI/PII shapes (bare SSN, phone, email, DOB).
 *      Each pattern carries its own `replace` string so multiple bare
 *      patterns can collapse to the same canonical placeholder
 *      (e.g. both `DOB-bare-iso` and `DOB-bare-us` emit
 *      `[REDACTED-DOB]`). The `hits` set still records the pattern
 *      `name` so the audit log can distinguish labeled vs bare sources.
 *
 * **Why both passes:** the input-side `detectPhi` gate intentionally
 * gates on labels to avoid blocking legit marketing copy (a clinic's
 * navigation menu may say "DOB" without it being PHI). The output side
 * is more aggressive because Claude's job is to FLAG / SUMMARIZE
 * quoted text, not echo it - so a bare SSN or DOB-shaped string in
 * Claude's output is almost certainly PHI being quoted back. False
 * positives (clinic's own phone, founding year, contact email) are
 * an accepted cost vs. PHI leakage into encrypted scans rows.
 */
function redactString(text: string): { cleaned: string; hits: Set<string> } {
  const hits = new Set<string>()
  let cleaned = text
  // Pass 1: labeled patterns.
  for (const { name, re } of PHI_REDACT_PATTERNS) {
    if (freshPattern(re).test(cleaned)) {
      hits.add(name)
      cleaned = cleaned.replace(freshPattern(re), `[REDACTED-${name}]`)
    }
  }
  // Pass 2: bare / label-less patterns. Each pattern brings its own
  // replacement string (so e.g. `DOB-bare-iso` and `DOB-bare-us`
  // collapse to the same `[REDACTED-DOB]` placeholder). The `name`
  // recorded in `hits` is the pattern name (suffix `-bare`) so
  // audit-log consumers can tell which surface fired.
  for (const { name, re, replace } of BARE_PHI_REDACT_PATTERNS) {
    if (freshPattern(re).test(cleaned)) {
      hits.add(name)
      cleaned = cleaned.replace(freshPattern(re), replace)
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
 * Output-side redactor is more aggressive than the input-side detectPhi:
 * the input side gates on labels to avoid blocking legit marketing copy
 * (e.g., "DOB" in a navigation menu); the output side accepts bare values
 * because Claude's job is to FLAG/SUMMARIZE quoted text, not echo it.
 * False positives (clinic's own phone, founding year) are an acceptable
 * cost vs. PHI leakage into encrypted scans rows.
 *
 * Replacement format: every match is swapped for the literal
 * `[REDACTED-{patternName}]` token (single contiguous bracketed string,
 * see `redactString` doc above for the rationale). Length is compact and
 * deterministic so any downstream char-offset feature can re-derive
 * offsets if needed; the placeholder cannot re-trigger any
 * PHI_REDACT_PATTERNS or BARE_PHI_REDACT_PATTERNS regex on a second pass.
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
