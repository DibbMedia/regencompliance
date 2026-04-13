import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Supabase to force in-memory fallback (no DB in tests)
vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          gt: () => ({
            maybeSingle: async () => ({ data: null, error: { code: "42P01", message: "table does not exist" } }),
          }),
        }),
      }),
    }),
  }),
}))

// We need a fresh module for each test to reset the internal Map
let checkRateLimit: typeof import("@/lib/rate-limit").checkRateLimit

beforeEach(async () => {
  vi.resetModules()
  const mod = await import("@/lib/rate-limit")
  checkRateLimit = mod.checkRateLimit
})

describe("checkRateLimit", () => {
  it("allows requests under the limit", async () => {
    const result = await checkRateLimit("test-key-1", 5, 60000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it("blocks requests over the limit", async () => {
    const key = "test-key-block"
    for (let i = 0; i < 3; i++) {
      await checkRateLimit(key, 3, 60000)
    }
    const result = await checkRateLimit(key, 3, 60000)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it("returns correct remaining count", async () => {
    const key = "test-key-remaining"
    const r1 = await checkRateLimit(key, 5, 60000)
    expect(r1.remaining).toBe(4)

    const r2 = await checkRateLimit(key, 5, 60000)
    expect(r2.remaining).toBe(3)

    const r3 = await checkRateLimit(key, 5, 60000)
    expect(r3.remaining).toBe(2)
  })

  it("resets after window expires", async () => {
    vi.useFakeTimers()
    const key = "test-key-reset"

    // Use up all requests
    for (let i = 0; i < 3; i++) {
      await checkRateLimit(key, 3, 1000)
    }
    const blocked = await checkRateLimit(key, 3, 1000)
    expect(blocked.allowed).toBe(false)

    // Advance time past the window
    vi.advanceTimersByTime(1500)

    const result = await checkRateLimit(key, 3, 1000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(2)

    vi.useRealTimers()
  })

  it("tracks different keys independently", async () => {
    for (let i = 0; i < 2; i++) {
      await checkRateLimit("key-a", 2, 60000)
    }
    const blockedA = await checkRateLimit("key-a", 2, 60000)
    expect(blockedA.allowed).toBe(false)

    const allowedB = await checkRateLimit("key-b", 2, 60000)
    expect(allowedB.allowed).toBe(true)
  })
})
