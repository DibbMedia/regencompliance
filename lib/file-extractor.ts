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

export function validateFile(
  size: number,
  filename: string,
  mimeType: string
): { valid: boolean; error?: string; resolvedMime: string } {
  if (size > MAX_FILE_SIZE) {
    return { valid: false, error: "File too large. Maximum size is 5MB.", resolvedMime: mimeType }
  }

  // Validate file extension
  const ext = filename.toLowerCase().match(/\.\w+$/)?.[0] ?? ""
  const ALLOWED_EXTENSIONS = new Set([".txt", ".pdf", ".docx"])
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: "Unsupported file extension. Only .txt, .pdf, and .docx files are allowed.", resolvedMime: mimeType }
  }

  // Resolve MIME from extension as a fallback (browsers can be unreliable)
  const resolvedMime = ALLOWED_MIME_TYPES.has(mimeType) ? mimeType : EXTENSION_TO_MIME[ext] ?? mimeType

  if (!ALLOWED_MIME_TYPES.has(resolvedMime)) {
    return { valid: false, error: "Unsupported file type. Please upload a .txt, .pdf, or .docx file.", resolvedMime }
  }

  return { valid: true, resolvedMime }
}

export async function extractTextFromFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ text: string; pageCount?: number } | null> {
  const { valid, resolvedMime } = validateFile(buffer.length, filename, mimeType)
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
