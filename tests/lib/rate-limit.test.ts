import { describe, it, expect, vi, beforeEach } from "vitest"

// We need a fresh module for each test to reset the internal Map
let checkRateLimit: typeof import("@/lib/rate-limit").checkRateLimit

beforeEach(async () => {
  vi.resetModules()
  const mod = await import("@/lib/rate-limit")
  checkRateLimit = mod.checkRateLimit
})

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const result = checkRateLimit("test-key-1", 5, 60000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it("blocks requests over the limit", () => {
    const key = "test-key-block"
    for (let i = 0; i < 3; i++) {
      checkRateLimit(key, 3, 60000)
    }
    const result = checkRateLimit(key, 3, 60000)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it("returns correct remaining count", () => {
    const key = "test-key-remaining"
    const r1 = checkRateLimit(key, 5, 60000)
    expect(r1.remaining).toBe(4)

    const r2 = checkRateLimit(key, 5, 60000)
    expect(r2.remaining).toBe(3)

    const r3 = checkRateLimit(key, 5, 60000)
    expect(r3.remaining).toBe(2)
  })

  it("resets after window expires", () => {
    vi.useFakeTimers()
    const key = "test-key-reset"

    // Use up all requests
    for (let i = 0; i < 3; i++) {
      checkRateLimit(key, 3, 1000)
    }
    const blocked = checkRateLimit(key, 3, 1000)
    expect(blocked.allowed).toBe(false)

    // Advance time past the window
    vi.advanceTimersByTime(1500)

    const result = checkRateLimit(key, 3, 1000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(2)

    vi.useRealTimers()
  })

  it("tracks different keys independently", () => {
    for (let i = 0; i < 2; i++) {
      checkRateLimit("key-a", 2, 60000)
    }
    const blockedA = checkRateLimit("key-a", 2, 60000)
    expect(blockedA.allowed).toBe(false)

    const allowedB = checkRateLimit("key-b", 2, 60000)
    expect(allowedB.allowed).toBe(true)
  })
})
