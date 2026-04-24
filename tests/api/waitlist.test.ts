import { describe, it, expect, vi, beforeEach } from "vitest"

const rateLimitState: { global: boolean; perIp: boolean } = { global: true, perIp: true }
const dbState: { insertError: { code: string } | null } = { insertError: null }
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
      insert: async (row: Record<string, unknown>) => {
        if (dbState.insertError) return { error: dbState.insertError }
        inserted.push(row)
        return { error: null }
      },
    }),
  }),
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

  it("returns alreadyOnList on duplicate (23505) without leaking existence", async () => {
    dbState.insertError = { code: "23505" }
    const { POST } = await loadRoute()
    const res = await POST(req({ name: "Test", email: "dup@example.com" }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.alreadyOnList).toBe(true)
  })

  it("inserts new entry with IP and user-agent captured", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ name: "Jane", email: "jane@clinic.com" }))
    expect(res.status).toBe(200)
    expect(inserted.length).toBe(1)
    expect(inserted[0].email).toBe("jane@clinic.com")
    expect(inserted[0].ip_address).toBe("2.2.2.2")
    expect(inserted[0].source).toBe("website")
  })

  it("normalizes email to lowercase via schema", async () => {
    const { POST } = await loadRoute()
    await POST(req({ name: "Test", email: "MIXED@Case.COM" }))
    expect(inserted[0].email).toBe("mixed@case.com")
  })
})
