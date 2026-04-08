import { describe, it, expect } from "vitest"
import { validateFile } from "@/lib/file-extractor"

describe("validateFile", () => {
  it("accepts valid .txt files", () => {
    const result = validateFile(1024, "test.txt", "text/plain")
    expect(result.valid).toBe(true)
    expect(result.resolvedMime).toBe("text/plain")
  })

  it("accepts valid .docx files", () => {
    const result = validateFile(
      1024,
      "test.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    expect(result.valid).toBe(true)
  })

  it("accepts valid .pdf files", () => {
    const result = validateFile(1024, "test.pdf", "application/pdf")
    expect(result.valid).toBe(true)
    expect(result.resolvedMime).toBe("application/pdf")
  })

  it("resolves MIME from extension when browser MIME is wrong", () => {
    // Browser sends generic octet-stream but file is .txt
    const result = validateFile(1024, "notes.txt", "application/octet-stream")
    expect(result.valid).toBe(true)
    expect(result.resolvedMime).toBe("text/plain")
  })

  it("rejects files over 10MB", () => {
    const elevenMB = 11 * 1024 * 1024
    const result = validateFile(elevenMB, "big.txt", "text/plain")
    expect(result.valid).toBe(false)
    expect(result.error).toContain("10MB")
  })

  it("accepts files exactly at 10MB", () => {
    const tenMB = 10 * 1024 * 1024
    const result = validateFile(tenMB, "exact.pdf", "application/pdf")
    expect(result.valid).toBe(true)
  })

  it("rejects unsupported file types", () => {
    const result = validateFile(1024, "image.jpg", "image/jpeg")
    expect(result.valid).toBe(false)
    expect(result.error).toContain("Unsupported file type")
  })

  it("rejects .exe files", () => {
    const result = validateFile(1024, "malware.exe", "application/x-msdownload")
    expect(result.valid).toBe(false)
  })
})
