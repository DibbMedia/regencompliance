import { describe, it, expect, vi, beforeEach } from "vitest"

// ─── Supabase mock — stubs the service client calls made inside the cron ──
vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          lt: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
        }),
      }),
    }),
    auth: { admin: { deleteUser: async () => ({ error: null }) } },
  }),
}))

const CRON_SECRET = "test-cron-secret-fixture"

beforeEach(() => {
  process.env.CRON_SECRET = CRON_SECRET
})

async function loadRoute() {
  vi.resetModules()
  return await import("@/app/api/cron/purge-cancelled/route")
}

function cronReq(auth?: string): Request {
  const headers: HeadersInit = {}
  if (auth !== undefined) headers["authorization"] = auth
  return new Request("http://localhost/api/cron/purge-cancelled", { headers })
}

describe("cron auth contract - representative test on /api/cron/purge-cancelled", () => {
  it("401s when authorization header is absent", async () => {
    const { GET } = await loadRoute()
    const res = await GET(cronReq())
    expect(res.status).toBe(401)
  })

  it("401s when bearer token does not match CRON_SECRET", async () => {
    const { GET } = await loadRoute()
    const res = await GET(cronReq("Bearer wrong-secret"))
    expect(res.status).toBe(401)
  })

  it("401s when bearer prefix missing", async () => {
    const { GET } = await loadRoute()
    const res = await GET(cronReq(CRON_SECRET))
    expect(res.status).toBe(401)
  })

  it("401s when CRON_SECRET env var is unset (fail-closed)", async () => {
    delete process.env.CRON_SECRET
    const { GET } = await loadRoute()
    const res = await GET(cronReq(`Bearer ${CRON_SECRET}`))
    expect(res.status).toBe(401)
  })

  it("200s when bearer matches CRON_SECRET exactly", async () => {
    const { GET } = await loadRoute()
    const res = await GET(cronReq(`Bearer ${CRON_SECRET}`))
    expect(res.status).toBe(200)
  })
})
