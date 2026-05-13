import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  createMonitoredSite,
  decryptMonitoredSiteRow,
  encryptMonitoredSiteWrite,
  getMonitoredSite,
  getMonitoredSiteForAdmin,
  listMonitoredSites,
  updateMonitoredSite,
  type MonitoredSiteEncryptedRow,
  type MonitoredSiteWrite,
} from "@/lib/repos/monitored-sites"

const VALID_KEY = "a".repeat(64)

const PROFILE_A = "11111111-1111-4111-8111-111111111111"
const PROFILE_B = "22222222-2222-4222-8222-222222222222"
const SITE_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc"
const SITE_ID_OTHER = "dddddddd-dddd-4ddd-8ddd-dddddddddddd"

beforeAll(() => {
  process.env.ENCRYPTION_KEY_V1 = VALID_KEY
})

beforeEach(() => {
  process.env.ENCRYPTION_KEY_V1 = VALID_KEY
})

function buildEncryptedRow(
  profileId: string,
  siteId: string,
  input: Partial<MonitoredSiteWrite> = {},
): MonitoredSiteEncryptedRow {
  const write: MonitoredSiteWrite = {
    profile_id: profileId,
    domain: input.domain ?? "clinic.example.com",
    name: input.name ?? "Main Clinic Site",
    is_active: input.is_active ?? true,
    crawl_frequency: input.crawl_frequency ?? "weekly",
    last_crawl_at: input.last_crawl_at ?? null,
    next_crawl_at: input.next_crawl_at ?? "2026-05-20T00:00:00Z",
    total_pages: input.total_pages ?? 12,
    avg_compliance_score: input.avg_compliance_score ?? 88,
  }
  const insert = encryptMonitoredSiteWrite(profileId, write, siteId)
  return {
    id: siteId,
    profile_id: profileId,
    domain_enc: insert.domain_enc,
    name_enc: insert.name_enc,
    is_active: insert.is_active ?? true,
    crawl_frequency: insert.crawl_frequency ?? null,
    last_crawl_at: insert.last_crawl_at ?? null,
    next_crawl_at: insert.next_crawl_at ?? null,
    total_pages: insert.total_pages ?? 0,
    avg_compliance_score: insert.avg_compliance_score ?? null,
    created_at: "2026-05-13T00:00:00Z",
    updated_at: "2026-05-13T00:00:00Z",
  }
}

function makeMockSupabase(opts: {
  selectResult?: { data: unknown; error: unknown; count?: number }
  insertResult?: { data: unknown; error: unknown }
  updateResult?: { data: unknown; error: unknown }
} = {}) {
  const calls: {
    insertPayload?: unknown
    updatePayload?: unknown
    table?: string
    eqFilters: Array<[string, unknown]>
    op?: "select" | "insert" | "update"
  } = { eqFilters: [] }

  const builder: Record<string, unknown> = {}
  const resolver = () => {
    if (calls.op === "insert") return Promise.resolve(opts.insertResult)
    if (calls.op === "update") return Promise.resolve(opts.updateResult)
    return Promise.resolve(opts.selectResult)
  }

  builder.from = vi.fn((t: string) => {
    calls.table = t
    return builder
  })
  builder.select = vi.fn(() => {
    if (!calls.op) calls.op = "select"
    return builder
  })
  builder.insert = vi.fn((p: unknown) => {
    calls.op = "insert"
    calls.insertPayload = p
    return builder
  })
  builder.update = vi.fn((p: unknown) => {
    calls.op = "update"
    calls.updatePayload = p
    return builder
  })
  builder.eq = vi.fn((col: string, val: unknown) => {
    calls.eqFilters.push([col, val])
    return builder
  })
  builder.order = vi.fn(() => builder)
  builder.range = vi.fn(() => builder)
  builder.maybeSingle = vi.fn(() => resolver())
  builder.single = vi.fn(() => resolver())
  builder.then = (onF: (v: unknown) => unknown, onR?: (e: unknown) => unknown) =>
    resolver().then(onF, onR)

  return { client: builder as unknown as SupabaseClient, calls }
}

describe("lib/repos/monitored-sites - pure transforms", () => {
  it("roundtrips domain + name via encryptMonitoredSiteWrite -> decryptMonitoredSiteRow", () => {
    const row = buildEncryptedRow(PROFILE_A, SITE_ID, {
      domain: "clinic.example.com",
      name: "Main Clinic Site",
    })
    const site = decryptMonitoredSiteRow(PROFILE_A, row)
    expect(site.domain).toBe("clinic.example.com")
    expect(site.name).toBe("Main Clinic Site")
    expect(site.id).toBe(SITE_ID)
  })

  it("NULL name_enc decrypts to null", () => {
    const base = buildEncryptedRow(PROFILE_A, SITE_ID)
    const row: MonitoredSiteEncryptedRow = { ...base, name_enc: null }
    const site = decryptMonitoredSiteRow(PROFILE_A, row)
    expect(site.name).toBeNull()
    expect(site.domain).toBe("clinic.example.com")
  })

  it("AAD binding: row id swap breaks decrypt", () => {
    const row = buildEncryptedRow(PROFILE_A, SITE_ID)
    const tampered: MonitoredSiteEncryptedRow = { ...row, id: SITE_ID_OTHER }
    expect(() => decryptMonitoredSiteRow(PROFILE_A, tampered)).toThrow(/Decrypt failed/)
  })

  it("cross-profile decrypt fails", () => {
    const row = buildEncryptedRow(PROFILE_A, SITE_ID)
    expect(() => decryptMonitoredSiteRow(PROFILE_B, row)).toThrow(/Decrypt failed/)
  })
})

describe("lib/repos/monitored-sites - createMonitoredSite", () => {
  it("encrypts domain + name; no plaintext leaks into insert payload", async () => {
    const row = buildEncryptedRow(PROFILE_A, SITE_ID)
    const { client, calls } = makeMockSupabase({
      insertResult: { data: row, error: null },
    })

    const site = await createMonitoredSite(client, {
      id: SITE_ID,
      profile_id: PROFILE_A,
      domain: "clinic.example.com",
      name: "Main Clinic Site",
      is_active: true,
      crawl_frequency: "weekly",
    })

    expect(site.domain).toBe("clinic.example.com")

    const payload = calls.insertPayload as Record<string, unknown>
    expect(payload.domain_enc).toMatch(/^v1u\./)
    expect(payload.name_enc).toMatch(/^v1u\./)
    expect(payload).not.toHaveProperty("domain")
    expect(payload).not.toHaveProperty("name")
    expect(payload.profile_id).toBe(PROFILE_A)
    expect(payload.is_active).toBe(true)
    expect(payload.crawl_frequency).toBe("weekly")
  })
})

describe("lib/repos/monitored-sites - getMonitoredSite", () => {
  it("decrypts a single site", async () => {
    const row = buildEncryptedRow(PROFILE_A, SITE_ID)
    const { client, calls } = makeMockSupabase({
      selectResult: { data: row, error: null },
    })

    const site = await getMonitoredSite(client, PROFILE_A, SITE_ID)
    expect(site).not.toBeNull()
    expect(site!.domain).toBe("clinic.example.com")
    expect(calls.eqFilters).toContainEqual(["id", SITE_ID])
    expect(calls.eqFilters).toContainEqual(["profile_id", PROFILE_A])
  })

  it("returns null when row missing", async () => {
    const { client } = makeMockSupabase({ selectResult: { data: null, error: null } })
    const site = await getMonitoredSite(client, PROFILE_A, SITE_ID)
    expect(site).toBeNull()
  })
})

describe("lib/repos/monitored-sites - updateMonitoredSite", () => {
  it("updates only name_enc when only name is patched (not domain_enc)", async () => {
    const updated = buildEncryptedRow(PROFILE_A, SITE_ID, { name: "Renamed Clinic" })
    const { client, calls } = makeMockSupabase({
      updateResult: { data: updated, error: null },
    })

    const site = await updateMonitoredSite(client, PROFILE_A, SITE_ID, { name: "Renamed Clinic" })
    expect(site.name).toBe("Renamed Clinic")

    const payload = calls.updatePayload as Record<string, unknown>
    expect(payload.name_enc).toMatch(/^v1u\./)
    expect(payload).not.toHaveProperty("domain_enc")
  })

  it("updates is_active without touching encrypted columns", async () => {
    const updated = buildEncryptedRow(PROFILE_A, SITE_ID, { is_active: false })
    updated.is_active = false
    const { client, calls } = makeMockSupabase({
      updateResult: { data: updated, error: null },
    })

    await updateMonitoredSite(client, PROFILE_A, SITE_ID, { is_active: false })
    const payload = calls.updatePayload as Record<string, unknown>
    expect(payload).not.toHaveProperty("domain_enc")
    expect(payload).not.toHaveProperty("name_enc")
    expect(payload.is_active).toBe(false)
  })
})

describe("lib/repos/monitored-sites - listMonitoredSites", () => {
  it("decrypts every row", async () => {
    const r1 = buildEncryptedRow(PROFILE_A, SITE_ID, { domain: "first.example.com" })
    const r2 = buildEncryptedRow(PROFILE_A, SITE_ID_OTHER, { domain: "second.example.com" })
    const { client } = makeMockSupabase({
      selectResult: { data: [r1, r2], error: null, count: 2 },
    })

    const result = await listMonitoredSites(client, PROFILE_A, { limit: 10 })
    expect(result.count).toBe(2)
    expect(result.sites[0].domain).toBe("first.example.com")
    expect(result.sites[1].domain).toBe("second.example.com")
  })
})

describe("lib/repos/monitored-sites - getMonitoredSiteForAdmin", () => {
  it("decrypts via the row's own profile_id", async () => {
    const row = buildEncryptedRow(PROFILE_A, SITE_ID)
    const { client, calls } = makeMockSupabase({
      selectResult: { data: row, error: null },
    })

    const site = await getMonitoredSiteForAdmin(client, SITE_ID)
    expect(site!.domain).toBe("clinic.example.com")
    expect(calls.eqFilters.find(([k]) => k === "profile_id")).toBeUndefined()
  })
})
