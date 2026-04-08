import { describe, it, expect } from "vitest"
import { isValidUUID, parsePagination, scanSchema, profileSchema } from "@/lib/validations"

describe("isValidUUID", () => {
  it("accepts valid UUIDs", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true)
    expect(isValidUUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")).toBe(true)
  })

  it("accepts uppercase UUIDs", () => {
    expect(isValidUUID("550E8400-E29B-41D4-A716-446655440000")).toBe(true)
  })

  it("rejects invalid UUIDs", () => {
    expect(isValidUUID("not-a-uuid")).toBe(false)
    expect(isValidUUID("550e8400-e29b-41d4-a716")).toBe(false)
    expect(isValidUUID("550e8400e29b41d4a716446655440000")).toBe(false)
  })

  it("rejects empty strings", () => {
    expect(isValidUUID("")).toBe(false)
  })
})

describe("parsePagination", () => {
  it("returns defaults for empty params", () => {
    const params = new URLSearchParams()
    const result = parsePagination(params)
    expect(result).toEqual({ page: 1, limit: 20 })
  })

  it("parses valid page and limit", () => {
    const params = new URLSearchParams({ page: "3", limit: "50" })
    const result = parsePagination(params)
    expect(result).toEqual({ page: 3, limit: 50 })
  })

  it("caps page at 1000", () => {
    const params = new URLSearchParams({ page: "9999" })
    const result = parsePagination(params)
    expect(result.page).toBe(1000)
  })

  it("caps limit at 100", () => {
    const params = new URLSearchParams({ limit: "500" })
    const result = parsePagination(params)
    expect(result.limit).toBe(100)
  })

  it("handles NaN gracefully", () => {
    const params = new URLSearchParams({ page: "abc", limit: "xyz" })
    const result = parsePagination(params)
    expect(result).toEqual({ page: 1, limit: 20 })
  })

  it("handles negative numbers", () => {
    const params = new URLSearchParams({ page: "-5", limit: "-10" })
    const result = parsePagination(params)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(1)
  })
})

describe("scanSchema", () => {
  it("accepts valid scan input", () => {
    const result = scanSchema.safeParse({
      text: "Check this copy for compliance",
      content_type: "website_copy",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty text", () => {
    const result = scanSchema.safeParse({
      text: "",
      content_type: "website_copy",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid content_type", () => {
    const result = scanSchema.safeParse({
      text: "Some text",
      content_type: "invalid_type",
    })
    expect(result.success).toBe(false)
  })
})

describe("profileSchema", () => {
  it("accepts valid profile with all fields", () => {
    const result = profileSchema.safeParse({
      clinic_name: "Test Clinic",
      treatments: ["PRP", "Stem Cells"],
      theme_preference: "dark",
    })
    expect(result.success).toBe(true)
  })

  it("accepts empty object (all fields optional)", () => {
    const result = profileSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("rejects treatments array over 20 items", () => {
    const treatments = Array.from({ length: 21 }, (_, i) => `Treatment ${i}`)
    const result = profileSchema.safeParse({ treatments })
    expect(result.success).toBe(false)
  })
})
