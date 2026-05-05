import { describe, it, expect, vi, beforeEach } from "vitest"

// Aggressive mock state for the lead-magnet route. Real network calls
// (Anthropic, the prospect's site, GHL) all stubbed; the test exercises
// the validation, rate-limit, SSRF, PHI, and lead-capture wiring.

const rateLimitState: Record<string, boolean> = { global: true, ip: true, host: true }
const ssrfShouldFail = { value: false }
const pageContent: { ok: boolean; text: string; title: string } = { ok: true, text: "Stem cell therapy is FDA-approved and cures arthritis. Schedule today.", title: "Test Page" }
const phiState = { detected: false }
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

vi.mock("@/lib/phi-filter", () => ({
  detectPhi: () => ({ detected: phiState.detected, patterns: phiState.detected ? ["SSN"] : [] }),
  PHI_ERROR_MESSAGE: "PHI detected",
}))

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
      create: async () => ({
        content: [{ type: "text", text: claudeResponse.json }],
        usage: { input_tokens: 100, output_tokens: 200 },
      }),
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
      insert: async (row: Record<string, unknown>) => {
        if (table === "free_audit_leads") inserted.push(row)
        return { error: null }
      },
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

  it("persists lead row + fires GHL free_audit on success", async () => {
    const { POST } = await loadRoute()
    await POST(req(validBody))
    expect(inserted.length).toBe(1)
    expect(inserted[0].email).toBe("lead@clinic.com")
    expect(inserted[0].website_url).toBe("https://target.example/")
    expect(inserted[0].compliance_score).toBe(25)
    expect(inserted[0].flag_count).toBe(3)
    expect(inserted[0].high_risk_count).toBe(2)
    expect(ghlCalls.length).toBe(1)
    expect(ghlCalls[0].event).toBe("free_audit")
  })
})
