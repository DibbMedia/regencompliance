import { NextResponse } from "next/server"

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])

function allowedOrigins(): string[] {
  const out: string[] = []
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (appUrl) {
    try {
      out.push(new URL(appUrl).origin)
    } catch {
      /* ignore malformed env */
    }
  }
  if (process.env.NODE_ENV !== "production") {
    out.push("http://localhost:3000", "http://127.0.0.1:3000")
  }
  return out
}

export function enforceOrigin(request: Request): NextResponse | null {
  if (!MUTATING_METHODS.has(request.method.toUpperCase())) return null

  const allow = allowedOrigins()
  if (allow.length === 0) return null

  const originHeader = request.headers.get("origin") || ""
  const refererHeader = request.headers.get("referer") || ""

  let requestOrigin = originHeader
  if (!requestOrigin && refererHeader) {
    try {
      requestOrigin = new URL(refererHeader).origin
    } catch {
      requestOrigin = ""
    }
  }

  if (!requestOrigin || !allow.includes(requestOrigin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return null
}
