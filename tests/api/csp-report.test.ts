import { describe, it, expect, vi, beforeEach } from "vitest"

const rateLimitState: { global: boolean; perIp: boolean } = { global: true, perIp: true }
const audited: Array<Record<string, unknown>> = []

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: async (key: string) => ({
    allowed: key.includes("global") ? rateLimitState.global : rateLimitState.perIp,
    remaining: 1,
  }),
}))

vi.mock("@/lib/audit-log", () => ({
  logAudit: (entry: Record<string, unknown>) => {
    audited.push(entry)
  },
}))

vi.mock("@/lib/ip", () => ({
  getClientIp: () => "5.5.5.5",
}))

async function loadRoute() {
  vi.resetModules()
  return await import("@/app/api/csp-report/route")
}

function legacyReport(body: unknown): Request {
  return new Request("http://localhost/api/csp-report", {
    method: "POST",
    headers: { "content-type": "application/csp-report" },
    body: JSON.stringify(body),
  })
}

function reportsReport(body: unknown): Request {
  return new Request("http://localhost/api/csp-report", {
    method: "POST",
    headers: { "content-type": "application/reports+json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/csp-report", () => {
  beforeEach(() => {
    rateLimitState.global = true
    rateLimitState.perIp = true
    audited.length = 0
  })

  it("ignores (204) and drops when global rate limit exhausted", async () => {
    rateLimitState.global = false
    const { POST } = await loadRoute()
    const res = await POST(legacyReport({ "csp-report": { "violated-directive": "script-src" } }))
    expect(res.status).toBe(204)
    expect(audited.length).toBe(0)
  })

  it("ignores (204) and drops when per-IP rate limit exhausted", async () => {
    rateLimitState.perIp = false
    const { POST } = await loadRoute()
    const res = await POST(legacyReport({ "csp-report": { "violated-directive": "script-src" } }))
    expect(res.status).toBe(204)
    expect(audited.length).toBe(0)
  })

  it("logs a legacy csp-report POST to audit_log", async () => {
    const { POST } = await loadRoute()
    const res = await POST(
      legacyReport({
        "csp-report": {
          "document-uri": "https://compliance.regenportal.com/login",
          "violated-directive": "script-src-elem",
          "effective-directive": "script-src-elem",
          "blocked-uri": "https://evil.example.com/xss.js",
        },
      }),
    )
    expect(res.status).toBe(204)
    expect(audited.length).toBe(1)
    expect(audited[0].action).toBe("csp.violation")
    const details = audited[0].details as Record<string, unknown>
    expect(details.violated_directive).toBe("script-src-elem")
    expect(details.blocked_url).toBe("https://evil.example.com/xss.js")
  })

  it("logs a modern reports+json array (multiple entries)", async () => {
    const { POST } = await loadRoute()
    const res = await POST(
      reportsReport([
        { type: "csp-violation", body: { violatedDirective: "style-src", blockedURL: "inline" } },
        { type: "csp-violation", body: { violatedDirective: "img-src", blockedURL: "http://tracker.com/x.gif" } },
        { type: "not-a-csp-violation", body: { some: "other" } },
      ]),
    )
    expect(res.status).toBe(204)
    expect(audited.length).toBe(2)
    expect((audited[0].details as Record<string, unknown>).violated_directive).toBe("style-src")
    expect((audited[1].details as Record<string, unknown>).blocked_url).toBe("http://tracker.com/x.gif")
  })

  it("truncates overly long sample text to 200 chars", async () => {
    const longSample = "x".repeat(500)
    const { POST } = await loadRoute()
    await POST(
      legacyReport({
        "csp-report": {
          "violated-directive": "script-src",
          "script-sample": longSample,
        },
      }),
    )
    expect(audited.length).toBe(1)
    const sample = (audited[0].details as Record<string, unknown>).sample as string
    expect(sample.length).toBe(200)
  })

  it("returns 204 on malformed JSON body without crashing", async () => {
    const { POST } = await loadRoute()
    const res = await POST(
      new Request("http://localhost/api/csp-report", {
        method: "POST",
        headers: { "content-type": "application/csp-report" },
        body: "not-json",
      }),
    )
    expect(res.status).toBe(204)
    expect(audited.length).toBe(0)
  })
})
