import { describe, it, expect, vi, beforeEach } from "vitest"

const rateLimitState = { ip: true }
const breachState = { breached: false }
const userState: { user: { id: string; email: string } | null } = {
  user: { id: "user-1", email: "user@x.com" },
}
const updateState: { error: { message: string } | null } = { error: null }
const updateCalls: Array<{ password: string }> = []
const signOutCalls: Array<{ scope: string }> = []
const auditCalls: Array<{ action: string }> = []

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: async () => ({ allowed: rateLimitState.ip, remaining: 1 }),
}))

vi.mock("@/lib/ip", () => ({ getClientIp: () => "1.1.1.1" }))

vi.mock("@/lib/audit-log", () => ({
  logAudit: (entry: { action: string }) => {
    auditCalls.push(entry)
  },
  getRequestMeta: () => ({ ip: "1.1.1.1", userAgent: "test" }),
}))

vi.mock("@/lib/password-breach", () => ({
  checkPasswordBreach: async () => ({ breached: breachState.breached, count: breachState.breached ? 100 : undefined }),
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: userState.user } }),
      updateUser: async (args: { password: string }) => {
        updateCalls.push(args)
        if (updateState.error) return { error: updateState.error }
        return { error: null }
      },
      signOut: async (opts: { scope: string }) => {
        signOutCalls.push(opts)
        return { error: null }
      },
    },
  }),
}))

function req(body: unknown): Request {
  return new Request("http://localhost/api/auth/reset-password", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

async function loadRoute() {
  vi.resetModules()
  return await import("@/app/api/auth/reset-password/route")
}

const VALID_PASSWORD = "Abcdefgh-1234!"

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    rateLimitState.ip = true
    breachState.breached = false
    userState.user = { id: "user-1", email: "user@x.com" }
    updateState.error = null
    updateCalls.length = 0
    signOutCalls.length = 0
    auditCalls.length = 0
  })

  it("429 when per-IP cap exhausted", async () => {
    rateLimitState.ip = false
    const { POST } = await loadRoute()
    const res = await POST(req({ password: VALID_PASSWORD }))
    expect(res.status).toBe(429)
  })

  it("400 on weak password (no uppercase)", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ password: "abcdefghij-1!" }))
    expect(res.status).toBe(400)
  })

  it("400 on short password", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ password: "Ab1!cdef" }))
    expect(res.status).toBe(400)
  })

  it("400 on breached password", async () => {
    breachState.breached = true
    const { POST } = await loadRoute()
    const res = await POST(req({ password: VALID_PASSWORD }))
    expect(res.status).toBe(400)
    expect(updateCalls.length).toBe(0)
  })

  it("401 when no recovery session", async () => {
    userState.user = null
    const { POST } = await loadRoute()
    const res = await POST(req({ password: VALID_PASSWORD }))
    expect(res.status).toBe(401)
    expect(updateCalls.length).toBe(0)
  })

  it("400 when supabase update fails", async () => {
    updateState.error = { message: "boom" }
    const { POST } = await loadRoute()
    const res = await POST(req({ password: VALID_PASSWORD }))
    expect(res.status).toBe(400)
  })

  it("happy path updates password + revokes other sessions + audits", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ password: VALID_PASSWORD }))
    expect(res.status).toBe(200)
    expect(updateCalls.length).toBe(1)
    expect(updateCalls[0].password).toBe(VALID_PASSWORD)
    expect(signOutCalls.length).toBe(1)
    expect(signOutCalls[0].scope).toBe("others")
    expect(auditCalls.find((c) => c.action === "auth.reset_password.success")).toBeTruthy()
  })
})
