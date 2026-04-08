import { describe, it, expect } from "vitest"

// The helper functions (normalizeUrl, shouldSkipUrl, resolveLink) are private.
// We test the module's exported types and the behavior indirectly.
// discoverPages and extractPageContent require network/mocking, so we test
// the contract shapes and edge cases we can verify without I/O.

describe("site-crawler module", () => {
  it("exports discoverPages function", async () => {
    const mod = await import("@/lib/site-crawler")
    expect(typeof mod.discoverPages).toBe("function")
  })

  it("exports extractPageContent function", async () => {
    const mod = await import("@/lib/site-crawler")
    expect(typeof mod.extractPageContent).toBe("function")
  })
})
