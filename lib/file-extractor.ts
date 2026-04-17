import mammoth from "mammoth"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_TEXT_LENGTH = 15000

const ALLOWED_MIME_TYPES = new Set([
  "text/plain",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
])

const EXTENSION_TO_MIME: Record<string, string> = {
  ".txt": "text/plain",
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d])
const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04])

function matchesMagic(buffer: Buffer, magic: Buffer): boolean {
  if (buffer.length < magic.length) return false
  for (let i = 0; i < magic.length; i++) {
    if (buffer[i] !== magic[i]) return false
  }
  return true
}

function looksLikePlainText(buffer: Buffer): boolean {
  if (buffer.length === 0) return true
  const sample = buffer.subarray(0, Math.min(buffer.length, 4096))
  let suspicious = 0
  for (let i = 0; i < sample.length; i++) {
    const b = sample[i]
    if (b >= 0x20 && b <= 0x7e) continue
    if (b === 0x09 || b === 0x0a || b === 0x0d || b === 0x0b || b === 0x0c) continue
    if (b >= 0x80 && b <= 0xfd) continue
    suspicious++
  }
  return suspicious / sample.length <= 0.1
}

export function validateFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): { valid: boolean; error?: string; resolvedMime: string } {
  if (buffer.length > MAX_FILE_SIZE) {
    return { valid: false, error: "File too large. Maximum size is 5MB.", resolvedMime: mimeType }
  }

  const ext = filename.toLowerCase().match(/\.\w+$/)?.[0] ?? ""
  const ALLOWED_EXTENSIONS = new Set([".txt", ".pdf", ".docx"])
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: "Unsupported file extension. Only .txt, .pdf, and .docx files are allowed.", resolvedMime: mimeType }
  }

  const resolvedMime = ALLOWED_MIME_TYPES.has(mimeType) ? mimeType : EXTENSION_TO_MIME[ext] ?? mimeType

  if (!ALLOWED_MIME_TYPES.has(resolvedMime)) {
    return { valid: false, error: "Unsupported file type. Please upload a .txt, .pdf, or .docx file.", resolvedMime }
  }

  let contentOk = false
  if (ext === ".pdf") {
    contentOk = matchesMagic(buffer, PDF_MAGIC)
  } else if (ext === ".docx") {
    contentOk = matchesMagic(buffer, ZIP_MAGIC)
  } else if (ext === ".txt") {
    contentOk = looksLikePlainText(buffer)
  }

  if (!contentOk) {
    return {
      valid: false,
      error: "File content doesn't match extension — rejected for safety.",
      resolvedMime,
    }
  }

  return { valid: true, resolvedMime }
}

export async function extractTextFromFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ text: string; pageCount?: number } | null> {
  const { valid, resolvedMime } = validateFile(buffer, filename, mimeType)
  if (!valid) return null

  try {
    switch (resolvedMime) {
      case "text/plain": {
        const text = buffer.toString("utf-8").slice(0, MAX_TEXT_LENGTH)
        return { text }
      }

      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
        const result = await mammoth.extractRawText({ buffer })
        const text = result.value.slice(0, MAX_TEXT_LENGTH)
        return { text }
      }

      case "application/pdf": {
        const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs")
        const data = new Uint8Array(buffer)
        const doc = await getDocument({ data, useSystemFonts: true }).promise
        const pageCount = doc.numPages
        const chunks: string[] = []

        for (let i = 1; i <= pageCount; i++) {
          const page = await doc.getPage(i)
          const content = await page.getTextContent()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pageText = content.items.map((item: any) => item.str).join(" ")
          chunks.push(pageText)
        }

        const text = chunks.join("\n").slice(0, MAX_TEXT_LENGTH)
        return { text, pageCount }
      }

      default:
        return null
    }
  } catch (err) {
    console.error("File text extraction failed:", err)
    return null
  }
}
