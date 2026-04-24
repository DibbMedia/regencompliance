// Browser-posted CSP violation reports. Receives both the legacy
// report-uri shape (application/csp-report) and the modern report-to shape
// (application/reports+json). Logs to audit_log so we have visibility into
// blocked XSS attempts, misconfigured CSP directives, and extensions that
// trigger noise.
//
// Unauthenticated by design - browsers send these with no credentials. See
// proxy.ts for the auth-check skip. Rate-limited to blunt a compromised
// site generating thousands of reports per minute.
import { NextResponse } from "next/server"
import { logAudit } from "@/lib/audit-log"
import { getClientIp } from "@/lib/ip"
import { checkRateLimit } from "@/lib/rate-limit"

export const maxDuration = 5

interface NormalizedReport {
  // Index signature makes the shape assignable to the Record<string, unknown>
  // expected by logAudit's `details` param. Named fields below are just the
  // subset we actually care about surfacing.
  [key: string]: unknown
  document_url?: string
  violated_directive?: string
  effective_directive?: string
  blocked_url?: string
  source_file?: string
  line_number?: number
  column_number?: number
  disposition?: string
  sample?: string
}

function normalizeLegacy(body: unknown): NormalizedReport | null {
  if (!body || typeof body !== "object") return null
  const r = (body as { "csp-report"?: Record<string, unknown> })["csp-report"]
  if (!r || typeof r !== "object") return null
  return {
    document_url: typeof r["document-uri"] === "string" ? (r["document-uri"] as string) : undefined,
    violated_directive: typeof r["violated-directive"] === "string" ? (r["violated-directive"] as string) : undefined,
    effective_directive: typeof r["effective-directive"] === "string" ? (r["effective-directive"] as string) : undefined,
    blocked_url: typeof r["blocked-uri"] === "string" ? (r["blocked-uri"] as string) : undefined,
    source_file: typeof r["source-file"] === "string" ? (r["source-file"] as string) : undefined,
    line_number: typeof r["line-number"] === "number" ? (r["line-number"] as number) : undefined,
    column_number: typeof r["column-number"] === "number" ? (r["column-number"] as number) : undefined,
    disposition: typeof r["disposition"] === "string" ? (r["disposition"] as string) : undefined,
    sample: typeof r["script-sample"] === "string" ? (r["script-sample"] as string).slice(0, 200) : undefined,
  }
}

function normalizeReportTo(body: unknown): NormalizedReport[] {
  if (!Array.isArray(body)) return []
  const out: NormalizedReport[] = []
  for (const item of body) {
    if (!item || typeof item !== "object") continue
    const obj = item as Record<string, unknown>
    if (obj.type !== "csp-violation") continue
    const r = obj.body as Record<string, unknown> | undefined
    if (!r || typeof r !== "object") continue
    out.push({
      document_url: typeof r.documentURL === "string" ? r.documentURL : undefined,
      violated_directive: typeof r.violatedDirective === "string" ? r.violatedDirective : undefined,
      effective_directive: typeof r.effectiveDirective === "string" ? r.effectiveDirective : undefined,
      blocked_url: typeof r.blockedURL === "string" ? r.blockedURL : undefined,
      source_file: typeof r.sourceFile === "string" ? r.sourceFile : undefined,
      line_number: typeof r.lineNumber === "number" ? r.lineNumber : undefined,
      column_number: typeof r.columnNumber === "number" ? r.columnNumber : undefined,
      disposition: typeof r.disposition === "string" ? r.disposition : undefined,
      sample: typeof r.sample === "string" ? r.sample.slice(0, 200) : undefined,
    })
  }
  return out
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const userAgent = request.headers.get("user-agent")?.slice(0, 500) || null

  // Global cap - a compromised site can spew thousands/minute, we don't
  // want that filling audit_log.
  const global = await checkRateLimit("csp-report-global", 1000, 60 * 60 * 1000)
  if (!global.allowed) return new NextResponse(null, { status: 204 })

  const perIp = await checkRateLimit(`csp-report:${ip}`, 60, 10 * 60 * 1000)
  if (!perIp.allowed) return new NextResponse(null, { status: 204 })

  const contentType = request.headers.get("content-type") || ""
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new NextResponse(null, { status: 204 })
  }

  const reports: NormalizedReport[] = []
  if (contentType.includes("application/csp-report")) {
    const r = normalizeLegacy(body)
    if (r) reports.push(r)
  } else if (contentType.includes("application/reports+json") || Array.isArray(body)) {
    reports.push(...normalizeReportTo(body))
  } else {
    // Unknown content type - best-effort both parsers
    const legacy = normalizeLegacy(body)
    if (legacy) reports.push(legacy)
    else reports.push(...normalizeReportTo(body))
  }

  for (const report of reports) {
    logAudit({
      action: "csp.violation",
      resource_type: "csp",
      details: report,
      ip_address: ip,
      user_agent: userAgent ?? undefined,
      status: "error",
    })
  }

  // Browsers ignore the response body; 204 is the canonical choice.
  return new NextResponse(null, { status: 204 })
}
