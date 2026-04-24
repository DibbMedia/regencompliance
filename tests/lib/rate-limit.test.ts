import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Supabase. lib/rate-limit uses .rpc("increment_rate_limit") since
// migration 017; emulate the atomic upsert by tracking counts in-memory
// keyed by the p_key argument.
const counts = new Map<string, { count: number; expiresAt: number }>()

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: () => ({
    rpc: async (
      _name: string,
      args: { p_key: string; p_window_ms: number },
    ): Promise<{ data: number; error: null }> => {
      const now = Date.now()
      const existing = counts.get(args.p_key)
      if (!existing || existing.expiresAt < now) {
        counts.set(args.p_key, { count: 1, expiresAt: now + args.p_window_ms })
        return { data: 1, error: null }
      }
      existing.count += 1
      return { data: existing.count, error: null }
    },
  }),
}))

let checkRateLimit: typeof import("@/lib/rate-limit").checkRateLimit

beforeEach(async () => {
  counts.clear()
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
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))
    const key = "test-key-reset"

    for (let i = 0; i < 3; i++) {
      await checkRateLimit(key, 3, 1000)
    }
    const blocked = await checkRateLimit(key, 3, 1000)
    expect(blocked.allowed).toBe(false)

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
