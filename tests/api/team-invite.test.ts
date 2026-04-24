import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextResponse } from "next/server"

type User = { id: string; email: string } | null

const state: {
  user: User
  rateLimit: boolean
  writeBlocked: NextResponse | null
  seatCount: number
  existingInvite: { id: string; email: string; invite_token: string } | null
} = {
  user: { id: "owner-1", email: "owner@clinic.com" },
  rateLimit: true,
  writeBlocked: null,
  seatCount: 0,
  existingInvite: null,
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: state.user } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            is: () => ({
              single: async () => ({ data: state.existingInvite, error: null }),
            }),
          }),
        }),
        count: "exact",
        head: true,
      }),
      insert: async () => ({ error: null }),
    }),
  }),
  createServiceClient: () => ({
    auth: {
      admin: {
        generateLink: async () => ({
          data: { properties: { action_link: "https://example.com/magic?code=abc" } },
          error: null,
        }),
      },
    },
  }),
}))

// Supabase's count-head query has a different chain shape; override by
// intercepting the `.select("*", { count: "exact", head: true })` call.
// Implemented inline in the mock above via `count`/`head` properties,
// but the real route chains .eq().count — easier to mock per-test.
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: async () => ({ allowed: state.rateLimit, remaining: 1 }),
}))

vi.mock("@/lib/impersonation", () => ({
  requireWriteMode: async () => state.writeBlocked,
}))

function req(body: unknown): Request {
  return new Request("http://localhost/api/team/invite", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

async function loadRoute() {
  vi.resetModules()
  return await import("@/app/api/team/invite/route")
}

describe("POST /api/team/invite - security contract", () => {
  beforeEach(() => {
    state.user = { id: "owner-1", email: "owner@clinic.com" }
    state.rateLimit = true
    state.writeBlocked = null
    state.seatCount = 0
    state.existingInvite = null
  })

  it("401 when not logged in", async () => {
    state.user = null
    const { POST } = await loadRoute()
    const res = await POST(req({ email: "invitee@clinic.com" }))
    expect(res.status).toBe(401)
  })

  it("429 when per-user invite rate limit exceeded", async () => {
    state.rateLimit = false
    const { POST } = await loadRoute()
    const res = await POST(req({ email: "invitee@clinic.com" }))
    expect(res.status).toBe(429)
  })

  it("403 when read-only impersonation blocks writes", async () => {
    state.writeBlocked = NextResponse.json({ error: "Read-only impersonation" }, { status: 403 })
    const { POST } = await loadRoute()
    const res = await POST(req({ email: "invitee@clinic.com" }))
    expect(res.status).toBe(403)
  })

  it("400 on invalid email", async () => {
    const { POST } = await loadRoute()
    const res = await POST(req({ email: "not-an-email" }))
    expect(res.status).toBe(400)
  })
})
