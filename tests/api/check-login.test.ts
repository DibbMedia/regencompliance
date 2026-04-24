import { describe, it, expect, vi, beforeEach } from "vitest"

// ─── Mocks ────────────────────────────────────────────────────
const ipLimitState: { allowed: boolean } = { allowed: true }
const loginState: { allowed: boolean; remainingAttempts: number; lockedUntil?: number } = {
  allowed: true,
  remainingAttempts: 5,
}
const calls: string[] = []

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: async () => ({ allowed: ipLimitState.allowed, remaining: 30 }),
}))

vi.mock("@/lib/ip", () => ({
  getClientIp: () => "9.9.9.9",
}))

vi.mock("@/lib/audit-log", () => ({
  getRequestMeta: () => ({ ip: "9.9.9.9", userAgent: "test" }),
  logAudit: (entry: { action: string }) => {
    calls.push(`audit:${entry.action}`)
  },
}))

vi.mock("@/lib/login-protection", () => ({
  checkLoginAllowed: async () => ({ ...loginState }),
  recordFailedLogin: async () => {
    calls.push("recordFailed")
  },
  clearLoginAttempts: async () => {
    calls.push("clearAttempts")
  },
}))

function req(body: unknown): Request {
  return new Request("http://localhost/api/auth/check-login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

async function loadRoute() {
  vi.resetModules()
  return await import("@/app/api/auth/check-login/route")
}

describe("POST /api/auth/check-login", () => {
  beforeEach(() => {
    ipLimitState.allowed = true
    loginState.allowed = true
    loginState.remainingAttempts = 5
    loginState.lockedUntil = undefined
    calls.length = 0
  })

  it("returns 429 when per-IP rate limit exceeded", async () => {
    ipLimitState.allowed = false
    const { POST } = await loadRoute()
    const res = await POST(req({ email: "x@y.com" }))
    expect(res.status).toBe(429)
  })

  it("returns 400 when email missing", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ success: true }))
    expect(res.status).toBe(400)
  })

  it("clears attempts on success=true and audits", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ email: "x@y.com", success: true }))
    expect(res.status).toBe(200)
    expect(calls).toContain("clearAttempts")
    expect(calls).toContain("audit:auth.login.success")
  })

  it("records failed login on success=false and returns lockout state", async () => {
    loginState.allowed = false
    loginState.remainingAttempts = 0
    loginState.lockedUntil = Date.now() + 30 * 60 * 1000

    const { POST } = await loadRoute()
    const res = await POST(req({ email: "x@y.com", success: false }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.allowed).toBe(false)
    expect(json.remainingAttempts).toBe(0)
    expect(json.lockedUntil).toBeDefined()
    expect(calls).toContain("recordFailed")
    expect(calls).toContain("audit:auth.login.failed")
  })

  it("reports current state on pre-login check (no success field)", async () => {
    loginState.allowed = true
    loginState.remainingAttempts = 3
    const { POST } = await loadRoute()
    const res = await POST(req({ email: "x@y.com" }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.allowed).toBe(true)
    expect(json.remainingAttempts).toBe(3)
    expect(calls).not.toContain("recordFailed")
    expect(calls).not.toContain("clearAttempts")
  })
})
