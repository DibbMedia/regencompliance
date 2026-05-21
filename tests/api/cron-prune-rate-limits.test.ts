import { describe, it, expect, vi, beforeEach } from "vitest"

// ─── Supabase mock — `.from().delete().lt().select()` chain ──────────────
// `dbCtx.deletedRows` is what the route's count derives from; `dbCtx.error`
// short-circuits to the failure branch. The chain mirrors the actual
// supabase-js builder shape so any drift in the route surfaces as a TS or
// runtime error here.
const dbCtx: {
  deletedRows: Array<{ id: string }> | null
  error: { message: string } | null
  capturedTable: string | null
  capturedCutoff: string | null
} = {
  deletedRows: [],
  error: null,
  capturedTable: null,
  capturedCutoff: null,
}

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: () => ({
    from: (table: string) => {
      dbCtx.capturedTable = table
      return {
        delete: () => ({
          lt: (_col: string, value: string) => {
            dbCtx.capturedCutoff = value
            return {
              select: async (_cols: string) =>
                dbCtx.error
                  ? { data: null, error: dbCtx.error }
                  : { data: dbCtx.deletedRows, error: null },
            }
          },
        }),
      }
    },
  }),
}))

// ─── Audit-log mock — capture every call so we can assert on action + status
const auditCalls: Array<{
  action: string
  status?: string
  details?: Record<string, unknown>
}> = []

vi.mock("@/lib/audit-log", () => ({
  logAudit: (entry: { action: string; status?: string; details?: Record<string, unknown> }) => {
    auditCalls.push(entry)
  },
}))

const CRON_SECRET = "test-cron-secret-prune"

beforeEach(() => {
  process.env.CRON_SECRET = CRON_SECRET
  dbCtx.deletedRows = []
  dbCtx.error = null
  dbCtx.capturedTable = null
  dbCtx.capturedCutoff = null
  auditCalls.length = 0
})

async function loadRoute() {
  vi.resetModules()
  return await import("@/app/api/cron/prune-rate-limits/route")
}

function cronReq(auth?: string): Request {
  const headers: HeadersInit = {}
  if (auth !== undefined) headers["authorization"] = auth
  return new Request("http://localhost/api/cron/prune-rate-limits", {
    method: "POST",
    headers,
  })
}

describe("POST /api/cron/prune-rate-limits — auth", () => {
  it("401s when authorization header is absent", async () => {
    const { POST } = await loadRoute()
    const res = await POST(cronReq())
    expect(res.status).toBe(401)
    // No DB or audit-log side effects before auth passes.
    expect(dbCtx.capturedTable).toBeNull()
    expect(auditCalls).toHaveLength(0)
  })

  it("401s when bearer token does not match CRON_SECRET (constant-time)", async () => {
    const { POST } = await loadRoute()
    const res = await POST(cronReq("Bearer wrong-secret"))
    expect(res.status).toBe(401)
    expect(dbCtx.capturedTable).toBeNull()
  })
})

describe("POST /api/cron/prune-rate-limits — happy path", () => {
  it("200s + returns pruned count on success", async () => {
    dbCtx.deletedRows = [{ id: "r1" }, { id: "r2" }, { id: "r3" }]
    const { POST } = await loadRoute()
    const res = await POST(cronReq(`Bearer ${CRON_SECRET}`))
    expect(res.status).toBe(200)
    const body = (await res.json()) as { pruned: number }
    expect(body.pruned).toBe(3)
    // Hit the right table.
    expect(dbCtx.capturedTable).toBe("rate_limits")
    // Cutoff is an ISO string ~1h before now.
    expect(dbCtx.capturedCutoff).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    const cutoffMs = Date.parse(dbCtx.capturedCutoff!)
    const expectedMs = Date.now() - 60 * 60 * 1000
    // Allow a generous +/- 5s window for test scheduling jitter.
    expect(Math.abs(cutoffMs - expectedMs)).toBeLessThan(5000)
  })

  it("returns pruned: 0 when no rows are expired", async () => {
    dbCtx.deletedRows = []
    const { POST } = await loadRoute()
    const res = await POST(cronReq(`Bearer ${CRON_SECRET}`))
    expect(res.status).toBe(200)
    const body = (await res.json()) as { pruned: number }
    expect(body.pruned).toBe(0)
  })
})

describe("POST /api/cron/prune-rate-limits — audit-log", () => {
  it("logs action='cron.prune_rate_limits' + status='success' on happy path", async () => {
    dbCtx.deletedRows = [{ id: "r1" }, { id: "r2" }]
    const { POST } = await loadRoute()
    await POST(cronReq(`Bearer ${CRON_SECRET}`))
    expect(auditCalls).toHaveLength(1)
    expect(auditCalls[0].action).toBe("cron.prune_rate_limits")
    expect(auditCalls[0].status).toBe("success")
    expect(auditCalls[0].details).toMatchObject({ pruned: 2 })
    expect(typeof auditCalls[0].details?.took_ms).toBe("number")
  })

  it("logs action='cron.prune_rate_limits' + status='failure' on DB error", async () => {
    dbCtx.error = { message: "connection refused" }
    const { POST } = await loadRoute()
    const res = await POST(cronReq(`Bearer ${CRON_SECRET}`))
    expect(res.status).toBe(500)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe("connection refused")
    expect(auditCalls).toHaveLength(1)
    expect(auditCalls[0].action).toBe("cron.prune_rate_limits")
    expect(auditCalls[0].status).toBe("failure")
    expect(auditCalls[0].details).toMatchObject({ error: "connection refused" })
    expect(typeof auditCalls[0].details?.took_ms).toBe("number")
  })
})
