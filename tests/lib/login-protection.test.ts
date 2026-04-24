import { describe, it, expect, vi, beforeEach } from "vitest"

// Shared mock state across all Supabase calls the module makes.
type RateLimitRow = { count: number; expires_at: string } | null
const state: {
  row: RateLimitRow
  rpcCount: number
  rpcCalls: number
  updates: Array<{ expires_at: string }>
} = {
  row: null,
  rpcCount: 0,
  rpcCalls: 0,
  updates: [],
}

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: () => ({
    from: (_table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: state.row, error: null }),
        }),
      }),
      update: (patch: { expires_at: string }) => ({
        eq: async () => {
          state.updates.push(patch)
          if (state.row) state.row.expires_at = patch.expires_at
          return { error: null }
        },
      }),
      delete: () => ({
        eq: async () => {
          state.row = null
          return { error: null }
        },
      }),
    }),
    rpc: async () => {
      state.rpcCalls += 1
      state.rpcCount += 1
      // Write-through: mimic increment_rate_limit writing to rate_limits.
      state.row = {
        count: state.rpcCount,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      }
      return { data: state.rpcCount, error: null }
    },
  }),
}))

let recordFailedLogin: typeof import("@/lib/login-protection").recordFailedLogin
let checkLoginAllowed: typeof import("@/lib/login-protection").checkLoginAllowed
let clearLoginAttempts: typeof import("@/lib/login-protection").clearLoginAttempts

beforeEach(async () => {
  state.row = null
  state.rpcCount = 0
  state.rpcCalls = 0
  state.updates = []
  vi.resetModules()
  const mod = await import("@/lib/login-protection")
  recordFailedLogin = mod.recordFailedLogin
  checkLoginAllowed = mod.checkLoginAllowed
  clearLoginAttempts = mod.clearLoginAttempts
})

describe("login-protection.recordFailedLogin — lockout cannot be extended", () => {
  it("increments on the first few failures", async () => {
    await recordFailedLogin("victim@example.com")
    await recordFailedLogin("victim@example.com")
    await recordFailedLogin("victim@example.com")
    expect(state.rpcCalls).toBe(3)
    expect(state.rpcCount).toBe(3)
  })

  it("sets lockout on the 5th failure", async () => {
    for (let i = 0; i < 5; i++) {
      await recordFailedLogin("victim@example.com")
    }
    expect(state.rpcCalls).toBe(5)
    // One UPDATE to extend expires_at to now+30min fired on attempt 5.
    expect(state.updates.length).toBe(1)
  })

  it("does NOT increment again once locked (prevents DoS extension)", async () => {
    // Put state directly into locked condition.
    state.row = {
      count: 5,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    }
    state.rpcCount = 5

    await recordFailedLogin("victim@example.com")
    await recordFailedLogin("victim@example.com")
    await recordFailedLogin("victim@example.com")

    // Short-circuit: no RPC calls, no UPDATE.
    expect(state.rpcCalls).toBe(0)
    expect(state.updates.length).toBe(0)
  })

  it("starts incrementing again once the lockout window has expired", async () => {
    // Simulate an expired lockout row.
    state.row = {
      count: 5,
      expires_at: new Date(Date.now() - 60 * 1000).toISOString(),
    }
    state.rpcCount = 5

    await recordFailedLogin("victim@example.com")
    expect(state.rpcCalls).toBe(1)
  })
})

describe("login-protection.checkLoginAllowed", () => {
  it("returns allowed=true with full attempts when no row exists", async () => {
    const r = await checkLoginAllowed("nobody@example.com")
    expect(r.allowed).toBe(true)
    expect(r.remainingAttempts).toBe(5)
  })

  it("returns allowed=false with lockedUntil when at cap", async () => {
    const lockedUntil = new Date(Date.now() + 30 * 60 * 1000)
    state.row = { count: 5, expires_at: lockedUntil.toISOString() }
    const r = await checkLoginAllowed("locked@example.com")
    expect(r.allowed).toBe(false)
    expect(r.remainingAttempts).toBe(0)
    expect(r.lockedUntil).toBe(lockedUntil.getTime())
  })

  it("returns remaining attempts when under cap", async () => {
    state.row = { count: 2, expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() }
    const r = await checkLoginAllowed("three-left@example.com")
    expect(r.allowed).toBe(true)
    expect(r.remainingAttempts).toBe(3)
  })
})

describe("login-protection.clearLoginAttempts", () => {
  it("deletes the row", async () => {
    state.row = { count: 2, expires_at: new Date().toISOString() }
    await clearLoginAttempts("cleared@example.com")
    expect(state.row).toBeNull()
  })
})
