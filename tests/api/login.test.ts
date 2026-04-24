import { describe, it, expect, vi, beforeEach } from "vitest"

// ─── Mocks ────────────────────────────────────────────────────
type SignInResult = {
  data: { user: { id: string } | null; session: unknown } | null
  error: { message: string; status?: number } | null
}

const mockSignIn = vi.fn<(args: { email: string; password: string }) => Promise<SignInResult>>()

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      signInWithPassword: (args: { email: string; password: string }) => mockSignIn(args),
    },
  }),
}))

const ipLimitAllowed = { value: true }
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: async () => ({ allowed: ipLimitAllowed.value, remaining: 30 }),
}))

vi.mock("@/lib/ip", () => ({
  getClientIp: () => "4.4.4.4",
}))

const audited: string[] = []
vi.mock("@/lib/audit-log", () => ({
  getRequestMeta: () => ({ ip: "4.4.4.4", userAgent: "test" }),
  logAudit: (entry: { action: string }) => {
    audited.push(entry.action)
  },
}))

const loginProtection: {
  allowed: boolean
  remainingAttempts: number
  lockedUntil?: number
  recorded: number
  cleared: number
} = {
  allowed: true,
  remainingAttempts: 5,
  lockedUntil: undefined,
  recorded: 0,
  cleared: 0,
}

vi.mock("@/lib/login-protection", () => ({
  checkLoginAllowed: async () => ({
    allowed: loginProtection.allowed,
    remainingAttempts: loginProtection.remainingAttempts,
    lockedUntil: loginProtection.lockedUntil,
  }),
  recordFailedLogin: async () => {
    loginProtection.recorded += 1
  },
  clearLoginAttempts: async () => {
    loginProtection.cleared += 1
  },
}))

function loginReq(body: unknown): Request {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

async function loadRoute() {
  vi.resetModules()
  return await import("@/app/api/auth/login/route")
}

describe("POST /api/auth/login (server-side login proxy)", () => {
  beforeEach(() => {
    mockSignIn.mockReset()
    mockSignIn.mockResolvedValue({
      data: { user: { id: "u1" }, session: { access_token: "fake" } },
      error: null,
    })
    ipLimitAllowed.value = true
    loginProtection.allowed = true
    loginProtection.remainingAttempts = 5
    loginProtection.lockedUntil = undefined
    loginProtection.recorded = 0
    loginProtection.cleared = 0
    audited.length = 0
  })

  it("429 when per-IP rate limit exceeded", async () => {
    ipLimitAllowed.value = false
    const { POST } = await loadRoute()
    const res = await POST(loginReq({ email: "a@b.com", password: "correct-pass" }))
    expect(res.status).toBe(429)
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it("400 on malformed JSON", async () => {
    const { POST } = await loadRoute()
    const res = await POST(new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{broken",
    }))
    expect(res.status).toBe(400)
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it("400 on missing email", async () => {
    const { POST } = await loadRoute()
    const res = await POST(loginReq({ password: "something" }))
    expect(res.status).toBe(400)
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it("401 when account is locked — skips Supabase call entirely", async () => {
    loginProtection.allowed = false
    loginProtection.remainingAttempts = 0
    loginProtection.lockedUntil = Date.now() + 30 * 60 * 1000

    const { POST } = await loadRoute()
    const res = await POST(loginReq({ email: "x@y.com", password: "pw" }))
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toMatch(/locked/i)
    expect(json.lockedUntil).toBeDefined()
    expect(mockSignIn).not.toHaveBeenCalled()
    expect(audited).toContain("auth.login.locked")
  })

  it("401 on bad credentials, records the failure and returns generic error", async () => {
    mockSignIn.mockResolvedValueOnce({
      data: null,
      error: { message: "Invalid login credentials", status: 400 },
    })
    const { POST } = await loadRoute()
    const res = await POST(loginReq({ email: "x@y.com", password: "wrong" }))
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toMatch(/invalid email or password/i)
    expect(json.error).not.toMatch(/Invalid login credentials/)
    expect(loginProtection.recorded).toBe(1)
    expect(audited).toContain("auth.login.failed")
  })

  it("200 on success, clears attempts, audits, returns session", async () => {
    const { POST } = await loadRoute()
    const res = await POST(loginReq({ email: "x@y.com", password: "correct-pass" }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.user).toEqual({ id: "u1" })
    expect(json.session).toBeDefined()
    expect(loginProtection.cleared).toBe(1)
    expect(loginProtection.recorded).toBe(0)
    expect(audited).toContain("auth.login.success")
  })
})
