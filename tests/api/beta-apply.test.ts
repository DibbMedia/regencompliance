import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest"

beforeAll(() => {
  process.env.ENCRYPTION_KEY_V1 = "a".repeat(64)
})

const rateLimitState = { global: true, perIp: true }
const dbState: { insertError: Error | null } = { insertError: null }
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
      insert: (row: Record<string, unknown>) => ({
        select: () => ({
          single: async () => {
            if (dbState.insertError) return { data: null, error: dbState.insertError }
            inserted.push(row)
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

  it("duplicate submissions write a second row (no unique constraint post-Phase-6)", async () => {
    // Per plan §12.1: email unique constraint dropped. No more 23505
    // idempotent-success path; dupes just write another row.
    const { POST } = await loadRoute()
    const res1 = await POST(req(validBody))
    const res2 = await POST(req(validBody))
    expect(res1.status).toBe(200)
    expect(res2.status).toBe(200)
    expect(inserted.length).toBe(2)
  })

  it("DB-level failure surfaces a 500 (no 23505 special-case anymore)", async () => {
    dbState.insertError = new Error("db is down")
    const { POST } = await loadRoute()
    const res = await POST(req(validBody))
    expect(res.status).toBe(500)
  })

  it("inserts encrypted row + fires GHL beta_apply on success", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req(validBody))
    expect(res.status).toBe(200)
    expect(inserted.length).toBe(1)
    const row = inserted[0]
    // All sensitive columns are *_enc (v1r. envelope), not plaintext.
    expect((row.email_enc as string).startsWith("v1r.")).toBe(true)
    expect((row.clinic_name_enc as string).startsWith("v1r.")).toBe(true)
    expect(row.email).toBeUndefined()
    expect(row.clinic_name).toBeUndefined()
    expect(row.source).toBe("website")
    expect(ghlCalls.length).toBe(1)
    expect(ghlCalls[0].event).toBe("beta_apply")
    // GHL gets plaintext (intentional - CRM of record per plan §6).
    expect(ghlCalls[0].contact.email).toBe("jane@clinic.com")
    expect(ghlCalls[0].contact.company).toBe("Acme Regen Health")
  })

  it("accepts empty website (optional)", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ ...validBody, website: "" }))
    expect(res.status).toBe(200)
    // Optional column: null in payload.
    expect(inserted[0].website_enc).toBeNull()
  })

  it("honeypot empty: legitimate submission with website_url2: '' succeeds + inserts + fires GHL", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ ...validBody, website_url2: "" }))
    expect(res.status).toBe(200)
    expect(inserted.length).toBe(1)
    expect(ghlCalls.length).toBe(1)
  })

  it("honeypot tripped: non-empty website_url2 returns silent 200 + drops insert + no GHL", async () => {
    // Bot fills the offscreen field. Route returns the same success shape
    // (no 4xx tell) but skips DB + GHL entirely.
    const { POST } = await loadRoute()
    const res = await POST(req({ ...validBody, website_url2: "http://spam.example" }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(inserted.length).toBe(0)
    expect(ghlCalls.length).toBe(0)
  })
})
