import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest"

beforeAll(() => {
  // crypto module fails to derive a row DEK without this.
  process.env.ENCRYPTION_KEY_V1 = "a".repeat(64)
})

const rateLimitState: { global: boolean; perIp: boolean } = { global: true, perIp: true }
// Repo throws when this is set; mimics a DB failure since the 23505 idempotent
// path is gone post-Phase-6 (plan §12.1 dropped unique constraints).
const dbState: { insertError: Error | null } = { insertError: null }
const inserted: Array<Record<string, unknown>> = []

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: async (key: string) => ({
    allowed: key.includes("global") ? rateLimitState.global : rateLimitState.perIp,
    remaining: 1,
  }),
}))

vi.mock("@/lib/ip", () => ({
  getClientIp: () => "2.2.2.2",
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
  sendToGhl: async () => {},
}))

function req(body: unknown): Request {
  return new Request("http://localhost/api/waitlist", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

async function loadRoute() {
  vi.resetModules()
  return await import("@/app/api/waitlist/route")
}

describe("POST /api/waitlist", () => {
  beforeEach(() => {
    rateLimitState.global = true
    rateLimitState.perIp = true
    dbState.insertError = null
    inserted.length = 0
  })

  it("429 when global cap exhausted", async () => {
    rateLimitState.global = false
    const { POST } = await loadRoute()
    const res = await POST(req({ name: "Test", email: "t@example.com" }))
    expect(res.status).toBe(429)
    expect(inserted.length).toBe(0)
  })

  it("429 when per-IP cap exhausted", async () => {
    rateLimitState.perIp = false
    const { POST } = await loadRoute()
    const res = await POST(req({ name: "Test", email: "t@example.com" }))
    expect(res.status).toBe(429)
  })

  it("400 on malformed JSON", async () => {
    const { POST } = await loadRoute()
    const res = await POST(new Request("http://localhost/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not json",
    }))
    expect(res.status).toBe(400)
  })

  it("400 on invalid email", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ name: "Test", email: "not-an-email" }))
    expect(res.status).toBe(400)
  })

  it("duplicate submissions write a second row (no unique constraint post-Phase-6)", async () => {
    // Per plan §12.1: email unique constraint was dropped because it cannot
    // survive encryption. The 23505 idempotent-success path is gone; a
    // duplicate submission just creates another row. The rate limits (5/IP
    // /10min) are the only dup-spam defense now.
    const { POST } = await loadRoute()
    const res1 = await POST(req({ name: "Test", email: "dup@example.com" }))
    const res2 = await POST(req({ name: "Test", email: "dup@example.com" }))
    expect(res1.status).toBe(200)
    expect(res2.status).toBe(200)
    expect(inserted.length).toBe(2)
  })

  it("DB-level failure surfaces a 500 (no 23505 special-case anymore)", async () => {
    dbState.insertError = new Error("db is down")
    const { POST } = await loadRoute()
    const res = await POST(req({ name: "Test", email: "err@example.com" }))
    expect(res.status).toBe(500)
  })

  it("inserts new entry; row carries encrypted email_enc, not plaintext", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ name: "Jane", email: "jane@clinic.com" }))
    expect(res.status).toBe(200)
    expect(inserted.length).toBe(1)
    const row = inserted[0]
    // Repo encrypts on write - the insert payload has email_enc (v1r. prefix),
    // not the plaintext email column.
    expect(typeof row.email_enc).toBe("string")
    expect((row.email_enc as string).startsWith("v1r.")).toBe(true)
    expect(row.email).toBeUndefined()
    expect(row.source).toBe("website")
  })

  it("honeypot empty: legitimate submission with website_url2: '' succeeds + inserts", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ name: "Jane", email: "jane@clinic.com", website_url2: "" }))
    expect(res.status).toBe(200)
    expect(inserted.length).toBe(1)
  })

  it("honeypot tripped: non-empty website_url2 returns silent 200 + drops insert", async () => {
    // Bot fills the offscreen field. Route must return the same success
    // shape as a real submission (no 4xx signal back), but skip the DB
    // insert + GHL ping entirely.
    const { POST } = await loadRoute()
    const res = await POST(req({
      name: "Spambot",
      email: "spam@spambot.example",
      website_url2: "http://spam.example",
    }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(inserted.length).toBe(0)
  })
})
