import { describe, it, expect, vi, beforeEach } from "vitest"

const rateLimitState: Record<string, boolean> = { ip: true, email: true }
const supabaseCalls: Array<{ email: string; redirectTo: string }> = []
const auditCalls: Array<{ action: string; status?: string }> = []
const supabaseShouldError = { value: false }

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: async (key: string) => ({
    allowed: key.includes("forgot-pw-ip") ? rateLimitState.ip : rateLimitState.email,
    remaining: 1,
  }),
}))

vi.mock("@/lib/ip", () => ({
  getClientIp: () => "9.9.9.9",
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      resetPasswordForEmail: async (email: string, opts: { redirectTo: string }) => {
        supabaseCalls.push({ email, redirectTo: opts.redirectTo })
        if (supabaseShouldError.value) return { error: { message: "supabase boom" } }
        return { error: null }
      },
    },
  }),
}))

vi.mock("@/lib/audit-log", () => ({
  logAudit: (entry: { action: string; status?: string }) => {
    auditCalls.push(entry)
  },
  getRequestMeta: () => ({ ip: "9.9.9.9", userAgent: "test" }),
}))

vi.mock("@/lib/site-url", () => ({
  SITE_URL: "https://example.com",
}))

function req(body: unknown): Request {
  return new Request("http://localhost/api/auth/forgot-password", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

async function loadRoute() {
  vi.resetModules()
  return await import("@/app/api/auth/forgot-password/route")
}

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    rateLimitState.ip = true
    rateLimitState.email = true
    supabaseCalls.length = 0
    auditCalls.length = 0
    supabaseShouldError.value = false
  })

  it("429 when per-IP cap exhausted", async () => {
    rateLimitState.ip = false
    const { POST } = await loadRoute()
    const res = await POST(req({ email: "user@x.com" }))
    expect(res.status).toBe(429)
    expect(supabaseCalls.length).toBe(0)
  })

  it("400 on invalid email", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ email: "not-email" }))
    expect(res.status).toBe(400)
  })

  it("400 on malformed JSON", async () => {
    const { POST } = await loadRoute()
    const res = await POST(new Request("http://localhost/api/auth/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not json",
    }))
    expect(res.status).toBe(400)
  })

  it("returns generic 200 even when per-email cap exhausted (no enumeration)", async () => {
    rateLimitState.email = false
    const { POST } = await loadRoute()
    const res = await POST(req({ email: "victim@x.com" }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    // Supabase should NOT be called when throttled
    expect(supabaseCalls.length).toBe(0)
    // Audit log should record the throttle
    expect(auditCalls.find((c) => c.action === "auth.forgot_password.throttled")).toBeTruthy()
  })

  it("calls supabase + logs success on happy path", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ email: "user@x.com" }))
    expect(res.status).toBe(200)
    expect(supabaseCalls.length).toBe(1)
    expect(supabaseCalls[0].email).toBe("user@x.com")
    expect(supabaseCalls[0].redirectTo).toBe("https://example.com/auth/reset-password")
    expect(auditCalls.find((c) => c.action === "auth.forgot_password.requested")).toBeTruthy()
  })

  it("returns generic 200 even when supabase errors (no enumeration)", async () => {
    supabaseShouldError.value = true
    const { POST } = await loadRoute()
    const res = await POST(req({ email: "user@x.com" }))
    expect(res.status).toBe(200)
    expect(auditCalls.find((c) => c.action === "auth.forgot_password.failed")).toBeTruthy()
  })

  it("normalizes email to lowercase", async () => {
    const { POST } = await loadRoute()
    await POST(req({ email: "MiXeD@Case.com" }))
    expect(supabaseCalls[0].email).toBe("mixed@case.com")
  })
})
