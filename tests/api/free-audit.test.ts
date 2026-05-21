import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest"

beforeAll(() => {
  process.env.ENCRYPTION_KEY_V1 = "a".repeat(64)
})

// Aggressive mock state for the lead-magnet route. Real network calls
// (Anthropic, the prospect's site, GHL) all stubbed; the test exercises
// the validation, rate-limit, SSRF, PHI, and lead-capture wiring.

const rateLimitState: Record<string, boolean> = { global: true, ip: true, host: true }
const ssrfShouldFail = { value: false }
const pageContent: { ok: boolean; text: string; title: string } = { ok: true, text: "Stem cell therapy is FDA-approved and cures arthritis. Schedule today.", title: "Test Page" }
const phiState = { detected: false }
// When useRealRedactor is true, the @/lib/phi-filter mock delegates the
// redactPhiInOutput call to the actual module (loaded lazily inside the
// stub at first invocation). This lets the DLP test exercise the real
// regex scrubber without restructuring the suite-wide vi.mock factory.
const useRealRedactor = { value: false }
const claudeResponse: { json: string } = {
  json: JSON.stringify({
    compliance_score: 25,
    summary: "Multiple high-risk efficacy and FDA-approval claims.",
    flags: [
      { matched_text: "FDA-approved", banned_phrase: "FDA-approved (stem cells)", risk_level: "high", reason: "No FDA approval for orthopedic stem cells.", alternative: "performed in an FDA-registered facility", context: "Stem cell therapy is FDA-approved and...", element_type: "p" },
      { matched_text: "cures arthritis", banned_phrase: "cures (disease state)", risk_level: "high", reason: "Treatment claim without substantiation.", alternative: "may help relieve arthritis symptoms", context: "FDA-approved and cures arthritis. Schedule...", element_type: "p" },
      { matched_text: "Schedule today", banned_phrase: "urgency-without-context", risk_level: "low", reason: "Mild urgency cue near efficacy claim raises FTC scrutiny.", alternative: "Book a consultation", context: "cures arthritis. Schedule today.", element_type: "p" },
    ],
  }),
}
const inserted: Array<Record<string, unknown>> = []
const ghlCalls: Array<{ event: string; contact: Record<string, unknown> }> = []
const anthropicCalls: Array<unknown> = []

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: async (key: string) => ({
    allowed:
      key.includes("global") ? rateLimitState.global :
      key.includes("ip") ? rateLimitState.ip :
      rateLimitState.host,
    remaining: 1,
  }),
}))

vi.mock("@/lib/ip", () => ({ getClientIp: () => "5.5.5.5" }))

vi.mock("@/lib/ssrf", () => ({
  assertSafeUrl: async () => ({ ok: !ssrfShouldFail.value, reason: ssrfShouldFail.value ? "Blocked" : undefined }),
}))

vi.mock("@/lib/site-crawler", () => ({
  extractPageContent: async () =>
    pageContent.ok ? { url: "https://target.example/", title: pageContent.title, text: pageContent.text } : null,
}))

vi.mock("@/lib/phi-filter", async () => {
  // Pull in the real module so we can delegate to its redactPhiInOutput
  // when useRealRedactor.value === true. Static import would defeat
  // vi.mock; this async factory loads the real impl exactly once and
  // the closure picks it up on every call to the mocked redactor.
  const actual = await vi.importActual<typeof import("@/lib/phi-filter")>("@/lib/phi-filter")
  return {
    detectPhi: () => ({ detected: phiState.detected, patterns: phiState.detected ? ["SSN"] : [] }),
    PHI_ERROR_MESSAGE: "PHI detected",
    redactPhiInOutput: (input: { summary?: string | null; flags?: unknown[] }) => {
      if (useRealRedactor.value) {
        return actual.redactPhiInOutput(input as Parameters<typeof actual.redactPhiInOutput>[0])
      }
      // Default: pass through, no PHI claimed.
      return {
        hadHits: false,
        hits: [] as string[],
        cleanedText: typeof input.summary === "string" ? input.summary : "",
        cleanedFlags: input.flags as never,
      }
    },
  }
})

vi.mock("@/lib/compliance-bible", () => ({
  getComplianceBiblePrompt: () => "[bible-stub]",
}))

vi.mock("@/lib/api-costs", () => ({
  trackApiUsage: () => {},
}))

vi.mock("@/lib/error-tracking", () => ({
  captureError: () => {},
}))

vi.mock("@/lib/anthropic", () => ({
  anthropic: {
    messages: {
      create: async (...args: unknown[]) => {
        anthropicCalls.push(args)
        return {
          content: [{ type: "text", text: claudeResponse.json }],
          usage: { input_tokens: 100, output_tokens: 200 },
        }
      },
    },
  },
}))

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: () => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          // For compliance_rules query: returns empty array
          then: (cb: (v: { data: unknown[] }) => unknown) => cb({ data: [] }),
        }),
      }),
      insert: (row: Record<string, unknown>) => ({
        select: () => ({
          single: async () => {
            if (table === "free_audit_leads") inserted.push(row)
            return { data: row, error: null }
          },
        }),
      }),
    }),
  }),
}))

vi.mock("@/lib/ghl", () => ({
  sendToGhl: async (event: string, contact: Record<string, unknown>) => {
    ghlCalls.push({ event, contact })
  },
}))

function req(body: unknown): Request {
  return new Request("http://localhost/api/free-audit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

async function loadRoute() {
  vi.resetModules()
  return await import("@/app/api/free-audit/route")
}

const validBody = {
  website_url: "https://target.example/",
  email: "lead@clinic.com",
  accept_terms: true,
}

describe("POST /api/free-audit", () => {
  beforeEach(() => {
    rateLimitState.global = true
    rateLimitState.ip = true
    rateLimitState.host = true
    ssrfShouldFail.value = false
    pageContent.ok = true
    phiState.detected = false
    inserted.length = 0
    ghlCalls.length = 0
    anthropicCalls.length = 0
    useRealRedactor.value = false
  })

  it("429 when global cap exhausted", async () => {
    rateLimitState.global = false
    const { POST } = await loadRoute()
    const res = await POST(req(validBody))
    expect(res.status).toBe(429)
  })

  it("429 when per-IP cap exhausted", async () => {
    rateLimitState.ip = false
    const { POST } = await loadRoute()
    const res = await POST(req(validBody))
    expect(res.status).toBe(429)
  })

  it("400 on missing email", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ website_url: "https://target.example/" }))
    expect(res.status).toBe(400)
  })

  it("400 on invalid URL", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ ...validBody, website_url: "not-a-url" }))
    expect(res.status).toBe(400)
  })

  it("400 on SSRF block", async () => {
    ssrfShouldFail.value = true
    const { POST } = await loadRoute()
    const res = await POST(req(validBody))
    expect(res.status).toBe(400)
  })

  it("422 when page content can't be extracted", async () => {
    pageContent.ok = false
    const { POST } = await loadRoute()
    const res = await POST(req(validBody))
    expect(res.status).toBe(422)
  })

  it("400 on PHI detected", async () => {
    phiState.detected = true
    const { POST } = await loadRoute()
    const res = await POST(req(validBody))
    expect(res.status).toBe(400)
  })

  it("happy path returns teaser with first 2 flags unlocked, rest locked", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req(validBody))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.flag_count).toBe(3)
    expect(json.unlocked).toBe(2)
    expect(json.locked).toBe(1)
    expect(json.flags).toHaveLength(3)
    // Sorted by severity (high before low)
    expect(json.flags[0].risk_level).toBe("high")
    expect(json.flags[0].locked).toBe(false)
    expect(json.flags[0].matched_text).toBe("FDA-approved")
    expect(json.flags[1].locked).toBe(false)
    // Third flag locked: matched_text and alternative null
    expect(json.flags[2].locked).toBe(true)
    expect(json.flags[2].matched_text).toBeNull()
    expect(json.flags[2].alternative).toBeNull()
    // Risk level still revealed
    expect(json.flags[2].risk_level).toBe("low")
  })

  it("persists encrypted lead row + fires GHL free_audit on success", async () => {
    const { POST } = await loadRoute()
    await POST(req(validBody))
    expect(inserted.length).toBe(1)
    const row = inserted[0]
    // Encryption: email/website_url come through as *_enc envelopes;
    // numeric counts stay plain.
    expect((row.email_enc as string).startsWith("v1r.")).toBe(true)
    expect((row.website_url_enc as string).startsWith("v1r.")).toBe(true)
    expect(row.email).toBeUndefined()
    expect(row.website_url).toBeUndefined()
    expect(row.compliance_score).toBe(25)
    expect(row.flag_count).toBe(3)
    expect(row.high_risk_count).toBe(2)
    expect(ghlCalls.length).toBe(1)
    expect(ghlCalls[0].event).toBe("free_audit")
  })

  it("no longer enforces per-email rate limit (plan §12.1)", async () => {
    // Pre-Phase-6 the route had a 5/email/day cap. That cap is gone
    // because email equality on an encrypted column is impossible.
    // Submitting twice with the same email should succeed twice.
    const { POST } = await loadRoute()
    const res1 = await POST(req(validBody))
    const res2 = await POST(req(validBody))
    expect(res1.status).toBe(200)
    expect(res2.status).toBe(200)
    expect(inserted.length).toBe(2)
  })

  it("honeypot empty: legitimate submission with website_url2: '' runs full scan + persists + fires GHL", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ ...validBody, website_url2: "" }))
    expect(res.status).toBe(200)
    expect(inserted.length).toBe(1)
    expect(ghlCalls.length).toBe(1)
    expect(anthropicCalls.length).toBe(1)
  })

  it("honeypot tripped: non-empty website_url2 silent 200, no Anthropic + no insert + no GHL", async () => {
    // Honeypot must short-circuit BEFORE the Anthropic call so bots can't
    // burn LLM budget by probing the route. We assert all three downstream
    // effects (Claude, DB, GHL) are skipped.
    const { POST } = await loadRoute()
    const res = await POST(req({ ...validBody, website_url2: "http://spam.example" }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(anthropicCalls.length).toBe(0)
    expect(inserted.length).toBe(0)
    expect(ghlCalls.length).toBe(0)
  })

  it("DLP: PHI in Claude summary is redacted before persist + return", async () => {
    // Simulate Claude echoing back labelled PHI (DOB/SSN/Patient Name/MRN) in
    // its summary + a flag's matched_text + context. The output scrubber
    // (redactPhiInOutput) should swap each match for a canonical
    // [REDACTED-{patternName}] placeholder before we persist OR return JSON.
    // We flip useRealRedactor.value so the route hits the real regex set;
    // detectPhi still no-ops (pageContent.text is the safe default).
    useRealRedactor.value = true
    claudeResponse.json = JSON.stringify({
      compliance_score: 30,
      summary: "Page references DOB: 1979-04-12 and SSN: 123-45-6789 in customer testimonials.",
      flags: [
        {
          matched_text: "Patient Name: John Doe loves our therapy",
          banned_phrase: "PHI in testimonial",
          risk_level: "high",
          reason: "Patient identifier in marketing copy.",
          alternative: "Anonymized testimonial",
          context: "MRN: 998877 - Patient Name: John Doe loves our therapy",
          element_type: "p",
        },
      ],
    })

    const { POST } = await loadRoute()
    const res = await POST(req(validBody))
    expect(res.status).toBe(200)
    const json = await res.json()
    // Summary scrubbed: raw PHI gone, placeholders present.
    expect(json.summary).not.toContain("123-45-6789")
    expect(json.summary).not.toContain("1979-04-12")
    expect(json.summary).toContain("[REDACTED-SSN]")
    expect(json.summary).toContain("[REDACTED-DOB]")
    // Single flag is within PUBLIC_FLAG_LIMIT so it's unlocked - the public
    // JSON surfaces its scrubbed matched_text + context. The same cleaned
    // form was passed into createFreeAuditLead (route mutates
    // scanResult.flags in-place before persist), so verifying the public
    // surface here covers both code paths; the encrypted flags_enc column
    // can't be inspected directly from the test side because the repo
    // encrypts JSONB through encryptJSONForRow.
    expect(json.flags).toHaveLength(1)
    expect(json.flags[0].locked).toBe(false)
    expect(json.flags[0].matched_text).toContain("[REDACTED-Patient label]")
    expect(json.flags[0].matched_text).not.toContain("John Doe")
    expect(json.flags[0].context).toContain("[REDACTED-MRN]")
    expect(json.flags[0].context).not.toContain("998877")
    // Persist happened (encrypted row is queued for insert).
    expect(inserted.length).toBe(1)

    useRealRedactor.value = false
    // Reset claudeResponse so subsequent tests in this suite (if any get
    // added below) see the default fixture again.
    claudeResponse.json = JSON.stringify({
      compliance_score: 25,
      summary: "Multiple high-risk efficacy and FDA-approval claims.",
      flags: [
        { matched_text: "FDA-approved", banned_phrase: "FDA-approved (stem cells)", risk_level: "high", reason: "No FDA approval for orthopedic stem cells.", alternative: "performed in an FDA-registered facility", context: "Stem cell therapy is FDA-approved and...", element_type: "p" },
        { matched_text: "cures arthritis", banned_phrase: "cures (disease state)", risk_level: "high", reason: "Treatment claim without substantiation.", alternative: "may help relieve arthritis symptoms", context: "FDA-approved and cures arthritis. Schedule...", element_type: "p" },
        { matched_text: "Schedule today", banned_phrase: "urgency-without-context", risk_level: "low", reason: "Mild urgency cue near efficacy claim raises FTC scrutiny.", alternative: "Book a consultation", context: "cures arthritis. Schedule today.", element_type: "p" },
      ],
    })
  })
})
