import { describe, it, expect, vi, beforeEach } from "vitest"

const rateLimitState = { global: true, perIp: true }
const dbState: { insertError: { code: string } | null } = { insertError: null }
const inserted: Array<Record<string, unknown>> = []
const ghlCalls: Array<{ event: string; contact: Record<string, unknown> }> = []

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: async (key: string) => ({
    allowed: key.includes("global") ? rateLimitState.global : rateLimitState.perIp,
    remaining: 1,
  }),
}))

vi.mock("@/lib/ip", () => ({
  getClientIp: () => "1.2.3.4",
}))

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: () => ({
    from: () => ({
      insert: async (row: Record<string, unknown>) => {
        if (dbState.insertError) return { error: dbState.insertError }
        inserted.push(row)
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
  return new Request("http://localhost/api/beta-apply", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

async function loadRoute() {
  vi.resetModules()
  return await import("@/app/api/beta-apply/route")
}

const validBody = {
  name: "Dr. Jane Smith",
  email: "jane@clinic.com",
  clinic_name: "Acme Regen Health",
  specialty: "regen_medicine",
  role: "owner",
  website: "https://acmeregen.com",
  monthly_volume: "16-50",
  why_apply:
    "We publish 30 marketing pieces a month and just pulled a warning letter. Need to scale review without an attorney on every post.",
  accept_terms: true,
}

describe("POST /api/beta-apply", () => {
  beforeEach(() => {
    rateLimitState.global = true
    rateLimitState.perIp = true
    dbState.insertError = null
    inserted.length = 0
    ghlCalls.length = 0
  })

  it("429 when global cap exhausted", async () => {
    rateLimitState.global = false
    const { POST } = await loadRoute()
    const res = await POST(req(validBody))
    expect(res.status).toBe(429)
    expect(inserted.length).toBe(0)
  })

  it("429 when per-IP cap exhausted", async () => {
    rateLimitState.perIp = false
    const { POST } = await loadRoute()
    const res = await POST(req(validBody))
    expect(res.status).toBe(429)
  })

  it("400 when accept_terms missing", async () => {
    const { POST } = await loadRoute()
    const { accept_terms: _ignored, ...rest } = validBody
    const res = await POST(req(rest))
    expect(res.status).toBe(400)
  })

  it("400 when why_apply too short", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ ...validBody, why_apply: "too short" }))
    expect(res.status).toBe(400)
  })

  it("400 when website is not a URL", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ ...validBody, website: "not-a-url" }))
    expect(res.status).toBe(400)
  })

  it("returns alreadyApplied on duplicate (23505) without leaking existence", async () => {
    dbState.insertError = { code: "23505" }
    const { POST } = await loadRoute()
    const res = await POST(req(validBody))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.alreadyApplied).toBe(true)
  })

  it("inserts row + fires GHL beta_apply on success", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req(validBody))
    expect(res.status).toBe(200)
    expect(inserted.length).toBe(1)
    expect(inserted[0].email).toBe("jane@clinic.com")
    expect(inserted[0].clinic_name).toBe("Acme Regen Health")
    expect(inserted[0].source).toBe("website")
    expect(inserted[0].ip_address).toBe("1.2.3.4")
    expect(ghlCalls.length).toBe(1)
    expect(ghlCalls[0].event).toBe("beta_apply")
    expect(ghlCalls[0].contact.email).toBe("jane@clinic.com")
    expect(ghlCalls[0].contact.company).toBe("Acme Regen Health")
  })

  it("normalizes email to lowercase", async () => {
    const { POST } = await loadRoute()
    await POST(req({ ...validBody, email: "MIXED@Case.COM" }))
    expect(inserted[0].email).toBe("mixed@case.com")
  })

  it("accepts empty website (optional)", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ ...validBody, website: "" }))
    expect(res.status).toBe(200)
    expect(inserted[0].website).toBeNull()
  })
})
