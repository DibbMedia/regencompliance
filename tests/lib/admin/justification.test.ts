import { describe, it, expect } from "vitest"
import { extractJustification } from "@/lib/admin/justification"

const STANDARD_ERROR =
  "Admin action requires a justification (10-500 chars) explaining why you're accessing this user's data."

describe("extractJustification", () => {
  it("rejects undefined body", () => {
    const r = extractJustification(undefined)
    expect(r.ok).toBe(false)
    expect(r.error?.status).toBe(400)
    expect(r.error?.body.error).toBe(STANDARD_ERROR)
  })

  it("rejects null body", () => {
    const r = extractJustification(null)
    expect(r.ok).toBe(false)
    expect(r.error?.status).toBe(400)
  })

  it("rejects body with no justification field", () => {
    const r = extractJustification({ foo: "bar" })
    expect(r.ok).toBe(false)
    expect(r.error?.status).toBe(400)
  })

  it("rejects body with non-string justification", () => {
    expect(extractJustification({ justification: 42 }).ok).toBe(false)
    expect(extractJustification({ justification: true }).ok).toBe(false)
    expect(extractJustification({ justification: null }).ok).toBe(false)
    expect(extractJustification({ justification: ["a", "b"] }).ok).toBe(false)
    expect(extractJustification({ justification: { nested: "x" } }).ok).toBe(false)
  })

  it("rejects empty string justification", () => {
    const r = extractJustification({ justification: "" })
    expect(r.ok).toBe(false)
    expect(r.error?.status).toBe(400)
  })

  it("rejects whitespace-only justification", () => {
    const r = extractJustification({ justification: "          " })
    expect(r.ok).toBe(false)
    expect(r.error?.status).toBe(400)
  })

  it("rejects too-short justification (under 10 chars after trim)", () => {
    expect(extractJustification({ justification: "short" }).ok).toBe(false)
    expect(extractJustification({ justification: "x" }).ok).toBe(false)
    expect(extractJustification({ justification: "test" }).ok).toBe(false)
    // exactly 9 chars
    expect(extractJustification({ justification: "123456789" }).ok).toBe(false)
  })

  it("accepts exactly 10-char justification", () => {
    const r = extractJustification({ justification: "1234567890" })
    expect(r.ok).toBe(true)
    expect(r.justification).toBe("1234567890")
    expect(r.error).toBeUndefined()
  })

  it("rejects too-long justification (over 500 chars after trim)", () => {
    const r = extractJustification({ justification: "x".repeat(600) })
    expect(r.ok).toBe(false)
    expect(r.error?.status).toBe(400)
  })

  it("rejects exactly 501-char justification", () => {
    const r = extractJustification({ justification: "x".repeat(501) })
    expect(r.ok).toBe(false)
  })

  it("accepts exactly 500-char justification", () => {
    const r = extractJustification({ justification: "x".repeat(500) })
    expect(r.ok).toBe(true)
    expect(r.justification?.length).toBe(500)
  })

  it("accepts a valid 50-char justification and returns the trimmed value", () => {
    const text =
      "Investigating support ticket #1234 - decrypt scan."
    expect(text.length).toBe(50)
    const r = extractJustification({ justification: text })
    expect(r.ok).toBe(true)
    expect(r.justification).toBe(text)
  })

  it("trims surrounding whitespace before length check", () => {
    const r = extractJustification({
      justification: "   Investigating customer ticket #4567   ",
    })
    expect(r.ok).toBe(true)
    expect(r.justification).toBe("Investigating customer ticket #4567")
  })

  it("rejects a string of all whitespace even if length > 10 before trim", () => {
    const r = extractJustification({ justification: "                          " })
    expect(r.ok).toBe(false)
  })

  it("returns the standard error message in every failure case", () => {
    const cases = [
      undefined,
      null,
      {},
      { justification: "" },
      { justification: "short" },
      { justification: "x".repeat(600) },
      { justification: 42 },
    ]
    for (const c of cases) {
      const r = extractJustification(c)
      expect(r.ok).toBe(false)
      expect(r.error?.body.error).toBe(STANDARD_ERROR)
      expect(r.error?.status).toBe(400)
    }
  })
})
