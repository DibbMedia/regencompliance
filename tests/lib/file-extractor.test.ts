import { describe, it, expect } from "vitest"
import { validateFile } from "@/lib/file-extractor"

const pdfBuffer = (size = 1024) => {
  const b = Buffer.alloc(size, 0x20)
  Buffer.from("%PDF-1.4\n").copy(b, 0)
  return b
}
const docxBuffer = (size = 1024) => {
  const b = Buffer.alloc(size, 0x20)
  Buffer.from([0x50, 0x4b, 0x03, 0x04]).copy(b, 0)
  return b
}
const txtBuffer = (content = "Hello, this is plain text.\n") => Buffer.from(content, "utf-8")

describe("validateFile", () => {
  it("accepts valid .txt files", () => {
    const result = validateFile(txtBuffer(), "test.txt", "text/plain")
    expect(result.valid).toBe(true)
    expect(result.resolvedMime).toBe("text/plain")
  })

  it("accepts valid .docx files", () => {
    const result = validateFile(
      docxBuffer(),
      "test.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    expect(result.valid).toBe(true)
  })

  it("accepts valid .pdf files", () => {
    const result = validateFile(pdfBuffer(), "test.pdf", "application/pdf")
    expect(result.valid).toBe(true)
    expect(result.resolvedMime).toBe("application/pdf")
  })

  it("resolves MIME from extension when browser MIME is wrong", () => {
    const result = validateFile(txtBuffer(), "notes.txt", "application/octet-stream")
    expect(result.valid).toBe(true)
    expect(result.resolvedMime).toBe("text/plain")
  })

  it("rejects files over 5MB", () => {
    const sixMB = Buffer.alloc(6 * 1024 * 1024, 0x20)
    Buffer.from("%PDF-1.4\n").copy(sixMB, 0)
    const result = validateFile(sixMB, "big.pdf", "application/pdf")
    expect(result.valid).toBe(false)
    expect(result.error).toContain("5MB")
  })

  it("accepts files exactly at 5MB", () => {
    const fiveMB = Buffer.alloc(5 * 1024 * 1024, 0x20)
    Buffer.from("%PDF-1.4\n").copy(fiveMB, 0)
    const result = validateFile(fiveMB, "exact.pdf", "application/pdf")
    expect(result.valid).toBe(true)
  })

  it("rejects unsupported file types", () => {
    const result = validateFile(Buffer.alloc(1024), "image.jpg", "image/jpeg")
    expect(result.valid).toBe(false)
    expect(result.error).toContain("Unsupported file")
  })

  it("rejects .exe files", () => {
    const result = validateFile(Buffer.alloc(1024), "malware.exe", "application/x-msdownload")
    expect(result.valid).toBe(false)
  })

  it("rejects a renamed binary claiming to be a .pdf (magic mismatch)", () => {
    const fake = Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00])
    const result = validateFile(fake, "fake.pdf", "application/pdf")
    expect(result.valid).toBe(false)
    expect(result.error).toContain("doesn't match extension")
  })

  it("rejects a renamed binary claiming to be a .docx (not a zip)", () => {
    const fake = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
    const result = validateFile(
      fake,
      "fake.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    expect(result.valid).toBe(false)
    expect(result.error).toContain("doesn't match extension")
  })

  it("rejects a binary blob claiming to be a .txt", () => {
    const fake = Buffer.alloc(1024, 0x00)
    const result = validateFile(fake, "fake.txt", "text/plain")
    expect(result.valid).toBe(false)
    expect(result.error).toContain("doesn't match extension")
  })
})
