import { describe, it, expect } from "vitest"
import { hashContent } from "@/lib/scan-cache"

describe("hashContent", () => {
  it("produces consistent hashes for same content", () => {
    const hash1 = hashContent("Hello World")
    const hash2 = hashContent("Hello World")
    expect(hash1).toBe(hash2)
  })

  it("is case-insensitive", () => {
    const hash1 = hashContent("Hello World")
    const hash2 = hashContent("hello world")
    expect(hash1).toBe(hash2)
  })

  it("trims leading and trailing whitespace", () => {
    const hash1 = hashContent("hello world")
    const hash2 = hashContent("  hello world  ")
    expect(hash1).toBe(hash2)
  })

  it("produces different hashes for different content", () => {
    const hash1 = hashContent("Hello World")
    const hash2 = hashContent("Goodbye World")
    expect(hash1).not.toBe(hash2)
  })

  it("returns a 64-character hex string (sha256)", () => {
    const hash = hashContent("test")
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it("handles empty string after trim", () => {
    const hash = hashContent("   ")
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })
})
