import { describe, it, expect } from "vitest"
import { detectPhi, redactPhiInOutput, PHI_ERROR_MESSAGE } from "@/lib/phi-filter"
import type { ScanFlag } from "@/lib/types"

// --------------------------------------------------------------------------
// Input-side gate (unchanged behaviour) - smoke tests so a future patch
// can't accidentally regress detectPhi while extending the redactor.
// --------------------------------------------------------------------------
describe("detectPhi (input-side, unchanged)", () => {
  it("returns detected=false + empty patterns for empty input", () => {
    expect(detectPhi("")).toEqual({ detected: false, patterns: [] })
  })

  it("flags an SSN", () => {
    const out = detectPhi("Patient SSN was 123-45-6789 on intake")
    expect(out.detected).toBe(true)
    expect(out.patterns).toContain("SSN")
  })

  it("flags a DOB label without needing the value", () => {
    const out = detectPhi("DOB: 01/02/1980")
    expect(out.detected).toBe(true)
    expect(out.patterns).toContain("DOB")
  })

  it("ignores normal marketing copy (no ICD-10 false positive on vitamin B12)", () => {
    const out = detectPhi("We offer vitamin B12 injections and PRP therapy.")
    expect(out.detected).toBe(false)
  })

  it("exposes a stable error message constant", () => {
    expect(PHI_ERROR_MESSAGE).toMatch(/patient information/i)
  })
})

// --------------------------------------------------------------------------
// Output-side scrubber - the new surface this test file is here to cover.
//
// Placeholder format contract: every match is replaced with the literal
// `[REDACTED-{name}]` token (single contiguous bracketed string). The
// `{name}` is the canonical pattern label (SSN, DOB, MRN, ...). The
// placeholder is compact and deterministic so downstream char-offset
// features can re-derive offsets if needed, and the placeholder itself
// is OUTSIDE every PHI_REDACT_PATTERNS regex so a second pass through
// the redactor is a no-op (idempotent).
// --------------------------------------------------------------------------
describe("redactPhiInOutput", () => {
  it("returns hadHits=false + empty hits/cleanedText for completely empty input", () => {
    const r = redactPhiInOutput({})
    expect(r.hadHits).toBe(false)
    expect(r.hits).toEqual([])
    expect(r.cleanedText).toBe("")
    expect(r.cleanedFlags).toBeUndefined()
  })

  it("returns hadHits=false when summary + flags are present but PHI-free", () => {
    const flags: ScanFlag[] = [
      {
        rule_id: "abc",
        matched_text: "guaranteed results",
        banned_phrase: "guaranteed results",
        risk_level: "high",
        reason: "FTC efficacy violation",
        alternative: "studies suggest improvement",
      },
    ]
    const r = redactPhiInOutput({
      summary: "Clinic copy is largely clean with two medium-risk phrases.",
      flags,
    })
    expect(r.hadHits).toBe(false)
    expect(r.hits).toEqual([])
    expect(r.cleanedText).toBe("Clinic copy is largely clean with two medium-risk phrases.")
    expect(r.cleanedFlags).toBeDefined()
    expect(r.cleanedFlags?.[0].matched_text).toBe("guaranteed results")
  })

  it("redacts an SSN in the summary", () => {
    const r = redactPhiInOutput({
      summary: "Found a patient SSN 123-45-6789 quoted in the testimonial section.",
    })
    expect(r.hadHits).toBe(true)
    expect(r.hits).toContain("SSN")
    expect(r.cleanedText).toContain("[REDACTED-SSN]")
    expect(r.cleanedText).not.toContain("123-45-6789")
  })

  it("redacts a DOB-labeled value in the summary", () => {
    const r = redactPhiInOutput({
      summary: "Testimonial reveals DOB: 03/14/1962 alongside the patient name.",
    })
    expect(r.hadHits).toBe(true)
    expect(r.hits).toContain("DOB")
    expect(r.cleanedText).toContain("[REDACTED-DOB]")
    expect(r.cleanedText).not.toContain("03/14/1962")
  })

  it("redacts an MRN-labeled value in the summary", () => {
    const r = redactPhiInOutput({
      summary: "Patient record exposed as MRN: 0042913 on the gallery page.",
    })
    expect(r.hadHits).toBe(true)
    expect(r.hits).toContain("MRN")
    expect(r.cleanedText).toContain("[REDACTED-MRN]")
    expect(r.cleanedText).not.toContain("0042913")
  })

  it("redacts SSN + DOB + MRN in flag matched_text and dedupes hits", () => {
    const flags: Array<{ matched_text?: string;[k: string]: unknown }> = [
      {
        rule_id: "r1",
        matched_text: "John Doe SSN 123-45-6789",
        banned_phrase: "personal info",
        risk_level: "high",
        reason: "PHI",
        alternative: "redact",
      },
      {
        rule_id: "r2",
        matched_text: "DOB: 04/15/1970 / MRN: 99887",
        banned_phrase: "personal info",
        risk_level: "high",
        reason: "PHI",
        alternative: "redact",
      },
    ]

    const r = redactPhiInOutput({ summary: undefined, flags })
    expect(r.hadHits).toBe(true)
    // Dedup: SSN should appear once even though it's in one flag.
    expect(r.hits.filter((h) => h === "SSN").length).toBe(1)
    expect(r.hits).toEqual(expect.arrayContaining(["SSN", "DOB", "MRN"]))

    expect(r.cleanedFlags).toBeDefined()
    expect(r.cleanedFlags?.[0].matched_text).toContain("[REDACTED-SSN]")
    expect(r.cleanedFlags?.[0].matched_text).not.toContain("123-45-6789")

    expect(r.cleanedFlags?.[1].matched_text).toContain("[REDACTED-DOB]")
    expect(r.cleanedFlags?.[1].matched_text).toContain("[REDACTED-MRN]")
    expect(r.cleanedFlags?.[1].matched_text).not.toContain("04/15/1970")
    expect(r.cleanedFlags?.[1].matched_text).not.toContain("99887")
  })

  it("redacts multiple distinct patterns in the SAME string", () => {
    const r = redactPhiInOutput({
      summary: "PHI burst: SSN 111-22-3333, DOB: 05/06/1972, MRN # 7777",
    })
    expect(r.hadHits).toBe(true)
    expect(r.hits).toEqual(expect.arrayContaining(["SSN", "DOB", "MRN"]))
    expect(r.cleanedText).toContain("[REDACTED-SSN]")
    expect(r.cleanedText).toContain("[REDACTED-DOB]")
    expect(r.cleanedText).toContain("[REDACTED-MRN]")
    expect(r.cleanedText).not.toContain("111-22-3333")
    expect(r.cleanedText).not.toContain("05/06/1972")
    expect(r.cleanedText).not.toContain("7777")
  })

  it("redacts MULTIPLE OCCURRENCES of the same pattern in one string", () => {
    // The global flag on PHI_REDACT_PATTERNS regexes is load-bearing - if a
    // future edit drops it, only the first SSN here would be redacted and
    // the second would leak into the persisted scan row.
    const r = redactPhiInOutput({
      summary: "Two SSNs leaked: 111-22-3333 and also 444-55-6666 in the page.",
    })
    expect(r.hadHits).toBe(true)
    expect(r.cleanedText).not.toContain("111-22-3333")
    expect(r.cleanedText).not.toContain("444-55-6666")
    // Two distinct placeholders in the cleaned string.
    const placeholderCount = (r.cleanedText.match(/\[REDACTED-SSN\]/g) || []).length
    expect(placeholderCount).toBe(2)
  })

  it("redacts PHI in the flag's context field as well as matched_text", () => {
    // context is the surrounding sentence; if Claude pulled the WHOLE
    // testimonial paragraph as context, we still need it scrubbed.
    const flags = [
      {
        rule_id: "r1",
        matched_text: "guaranteed cure",
        banned_phrase: "cure claim",
        risk_level: "high" as const,
        reason: "FTC violation",
        alternative: "may help",
        context: "John gave us his SSN 123-45-6789 and said this was a guaranteed cure.",
      },
    ]
    const r = redactPhiInOutput({ flags })
    expect(r.hadHits).toBe(true)
    expect(r.hits).toContain("SSN")
    expect(r.cleanedFlags?.[0].context).toContain("[REDACTED-SSN]")
    expect(r.cleanedFlags?.[0].context).not.toContain("123-45-6789")
    // matched_text was PHI-free so it stays as-is.
    expect(r.cleanedFlags?.[0].matched_text).toBe("guaranteed cure")
  })

  it("preserves other ScanFlag fields when redacting", () => {
    const flag: ScanFlag = {
      rule_id: "rule-uuid",
      matched_text: "Patient Name: Jane Doe",
      banned_phrase: "patient info",
      risk_level: "high",
      reason: "PHI exposed",
      alternative: "redact patient info",
      context: "From the website footer",
      element_type: "p",
    }
    const r = redactPhiInOutput({ flags: [flag] })
    const cleaned = r.cleanedFlags?.[0]
    expect(cleaned).toBeDefined()
    expect(cleaned?.rule_id).toBe("rule-uuid")
    expect(cleaned?.banned_phrase).toBe("patient info")
    expect(cleaned?.risk_level).toBe("high")
    expect(cleaned?.reason).toBe("PHI exposed")
    expect(cleaned?.alternative).toBe("redact patient info")
    expect(cleaned?.element_type).toBe("p")
    // The scrubbed field swaps in the placeholder.
    expect(cleaned?.matched_text).toContain("[REDACTED-Patient label]")
    expect(cleaned?.matched_text).not.toContain("Jane Doe")
  })

  it("handles null summary without throwing", () => {
    const r = redactPhiInOutput({ summary: null })
    expect(r.hadHits).toBe(false)
    expect(r.cleanedText).toBe("")
  })

  it("handles flags without matched_text defensively (coerces to empty string)", () => {
    // The JSON contract from Claude says matched_text is a string, but if a
    // malformed response slipped through, we should still return a cleaned
    // flag (with matched_text="") rather than throwing. Typed as
    // Array<{ matched_text?: string }> so the missing matched_text is a
    // legal input shape (a tighter ScanFlag would require the field).
    const flags: Array<{ matched_text?: string }> = [
      {
        // matched_text intentionally missing; the spread in redactPhiInOutput
        // preserves the other Claude-emitted fields, but they aren't in the
        // declared input type so we keep this object minimal.
      },
    ]
    const r = redactPhiInOutput({ flags })
    expect(r.hadHits).toBe(false)
    expect(r.cleanedFlags?.[0].matched_text).toBe("")
  })

  it("is idempotent: a second pass over already-cleaned output is a no-op", () => {
    // The placeholder format is intentionally outside every redact pattern
    // so a second sweep doesn't mangle the redacted text.
    const first = redactPhiInOutput({
      summary: "SSN 111-22-3333 was leaked.",
    })
    expect(first.cleanedText).toContain("[REDACTED-SSN]")

    const second = redactPhiInOutput({ summary: first.cleanedText })
    expect(second.hadHits).toBe(false)
    expect(second.cleanedText).toBe(first.cleanedText)
  })

  it("does not alias / mutate the caller's flag objects", () => {
    const flag = {
      rule_id: "r1",
      matched_text: "SSN: 222-33-4444",
      banned_phrase: "x",
      risk_level: "high" as const,
      reason: "y",
      alternative: "z",
    }
    const original = { ...flag }
    redactPhiInOutput({ flags: [flag] })
    // Caller's object is unchanged.
    expect(flag).toEqual(original)
  })

  it("redacts a labeled phone number", () => {
    const r = redactPhiInOutput({
      summary: "Contact info exposed: Phone: 555-123-4567 in the footer.",
    })
    expect(r.hadHits).toBe(true)
    expect(r.hits).toContain("Phone (labeled)")
    expect(r.cleanedText).toContain("[REDACTED-Phone (labeled)]")
    expect(r.cleanedText).not.toContain("555-123-4567")
  })
})
