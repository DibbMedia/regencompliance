import { describe, it, expect, vi, beforeEach } from "vitest"

// ─── Supabase mock ─────────────────────────────────────────────
type SignUpArgs = { email: string; password: string; options?: unknown }
type SignUpResult = {
  data: { user: { id: string } | null; session: unknown } | null
  error: { message: string; status?: number } | null
}

const mockSignUp = vi.fn<(args: SignUpArgs) => Promise<SignUpResult>>()

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { signUp: (args: SignUpArgs) => mockSignUp(args) },
  }),
}))

// ─── Rate-limit mock — default allow ──────────────────────────
const rateLimitState: { allowed: boolean } = { allowed: true }
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: async () => ({ allowed: rateLimitState.allowed, remaining: 5 }),
}))

vi.mock("@/lib/ip", () => ({
  getClientIp: () => "1.2.3.4",
}))

// ─── HIBP mock — default not breached ──────────────────────────
const breachState: { breached: boolean } = { breached: false }
vi.mock("@/lib/password-breach", () => ({
  checkPasswordBreach: async () => ({ breached: breachState.breached }),
}))

const STRONG_PASSWORD = "Strong!Pass123"

function jsonReq(body: unknown): Request {
  return new Request("http://localhost/api/auth/signup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

async function loadRoute() {
  vi.resetModules()
  return await import("@/app/api/auth/signup/route")
}

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    rateLimitState.allowed = true
    breachState.breached = false
    mockSignUp.mockReset()
    mockSignUp.mockResolvedValue({ data: { user: { id: "u1" }, session: null }, error: null })
  })

  it("rejects when per-IP rate limit exceeded", async () => {
    rateLimitState.allowed = false
    const { POST } = await loadRoute()
    const res = await POST(jsonReq({ email: "a@b.com", password: STRONG_PASSWORD, confirmPassword: STRONG_PASSWORD }))
    expect(res.status).toBe(429)
    const json = await res.json()
    expect(json.error).toMatch(/too many/i)
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it("rejects malformed JSON body with 400", async () => {
    const { POST } = await loadRoute()
    const res = await POST(new Request("http://localhost/api/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not json",
    }))
    expect(res.status).toBe(400)
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it("rejects weak password with 400 and zod message", async () => {
    const { POST } = await loadRoute()
    const res = await POST(jsonReq({ email: "a@b.com", password: "short", confirmPassword: "short" }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/at least 12/i)
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it("rejects mismatched confirm password", async () => {
    const { POST } = await loadRoute()
    const res = await POST(jsonReq({ email: "a@b.com", password: STRONG_PASSWORD, confirmPassword: "Different!Pass123" }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/do not match/i)
  })

  it("rejects passwords found in HIBP breach datasets", async () => {
    breachState.breached = true
    const { POST } = await loadRoute()
    const res = await POST(jsonReq({ email: "a@b.com", password: STRONG_PASSWORD, confirmPassword: STRONG_PASSWORD }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/known data breach/i)
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it("returns a generic message on Supabase error, never the raw message", async () => {
    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: { message: "User already registered", status: 422 },
    })
    const { POST } = await loadRoute()
    const res = await POST(jsonReq({ email: "existing@b.com", password: STRONG_PASSWORD, confirmPassword: STRONG_PASSWORD }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).not.toMatch(/already registered/i)
    expect(json.error).toMatch(/could not create account/i)
  })

  it("returns user payload on success", async () => {
    const { POST } = await loadRoute()
    const res = await POST(jsonReq({ email: "new@b.com", password: STRONG_PASSWORD, confirmPassword: STRONG_PASSWORD }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.user).toEqual({ id: "u1" })
  })
})
