import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest"

beforeAll(() => {
  process.env.ENCRYPTION_KEY_V1 = "a".repeat(64)
})

const rateLimitState: { global: boolean; perIp: boolean } = { global: true, perIp: true }
const dbState: { insertError: Error | null } = { insertError: null }
const inserted: Array<Record<string, unknown>> = []

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: async (key: string) => ({
    allowed: key.includes("global") ? rateLimitState.global : rateLimitState.perIp,
    remaining: 1,
  }),
}))

vi.mock("@/lib/ip", () => ({
  getClientIp: () => "3.3.3.3",
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

function req(body: unknown): Request {
  return new Request("http://localhost/api/newsletter", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

async function loadRoute() {
  vi.resetModules()
  return await import("@/app/api/newsletter/route")
}

describe("POST /api/newsletter", () => {
  beforeEach(() => {
    rateLimitState.global = true
    rateLimitState.perIp = true
    dbState.insertError = null
    inserted.length = 0
  })

  it("429 when global cap exhausted", async () => {
    rateLimitState.global = false
    const { POST } = await loadRoute()
    const res = await POST(req({ email: "t@example.com" }))
    expect(res.status).toBe(429)
  })

  it("429 when per-IP cap exhausted", async () => {
    rateLimitState.perIp = false
    const { POST } = await loadRoute()
    const res = await POST(req({ email: "t@example.com" }))
    expect(res.status).toBe(429)
  })

  it("400 on invalid email", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ email: "invalid" }))
    expect(res.status).toBe(400)
  })

  it("duplicate submissions write a second row (no unique constraint post-Phase-6)", async () => {
    // Per plan §12.1: email unique constraint dropped.
    const { POST } = await loadRoute()
    const res1 = await POST(req({ email: "dup@example.com" }))
    const res2 = await POST(req({ email: "dup@example.com" }))
    expect(res1.status).toBe(200)
    expect(res2.status).toBe(200)
    expect(inserted.length).toBe(2)
  })

  it("DB-level failure surfaces a 500", async () => {
    dbState.insertError = new Error("db is down")
    const { POST } = await loadRoute()
    const res = await POST(req({ email: "err@example.com" }))
    expect(res.status).toBe(500)
  })

  it("accepts optional sourceSlug for blog-post attribution", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ email: "reader@example.com", sourceSlug: "banned-words-2026" }))
    expect(res.status).toBe(200)
    expect((inserted[0].email_enc as string).startsWith("v1r.")).toBe(true)
    expect(inserted[0].email).toBeUndefined()
    expect(inserted[0].source_slug).toBe("banned-words-2026")
  })

  it("defaults source to 'blog' when not provided", async () => {
    const { POST } = await loadRoute()
    await POST(req({ email: "reader@example.com" }))
    expect(inserted[0].source).toBe("blog")
  })
})
