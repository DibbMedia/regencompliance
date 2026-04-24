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
  getClientIp: () => "3.3.3.3",
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

  it("returns alreadySubscribed on duplicate email (23505)", async () => {
    dbState.insertError = { code: "23505" }
    const { POST } = await loadRoute()
    const res = await POST(req({ email: "dup@example.com" }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.alreadySubscribed).toBe(true)
  })

  it("accepts optional sourceSlug for blog-post attribution", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ email: "reader@example.com", sourceSlug: "banned-words-2026" }))
    expect(res.status).toBe(200)
    expect(inserted[0].email).toBe("reader@example.com")
    expect(inserted[0].source_slug).toBe("banned-words-2026")
  })

  it("defaults source to 'blog' when not provided", async () => {
    const { POST } = await loadRoute()
    await POST(req({ email: "reader@example.com" }))
    expect(inserted[0].source).toBe("blog")
  })
})
