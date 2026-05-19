import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  createSitePage,
  decryptSitePageRow,
  encryptSitePageWrite,
  getSitePage,
  getSitePageForAdmin,
  listPagesForSite,
  updateSitePage,
  type SitePageEncryptedRow,
  type SitePageWrite,
} from "@/lib/repos/site-pages"

const VALID_KEY = "a".repeat(64)

const PROFILE_A = "11111111-1111-4111-8111-111111111111"
const PROFILE_B = "22222222-2222-4222-8222-222222222222"
const SITE_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc"
const PAGE_ID = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee"
const PAGE_ID_OTHER = "ffffffff-ffff-4fff-8fff-ffffffffffff"

beforeAll(() => {
  process.env.ENCRYPTION_KEY_V1 = VALID_KEY
})

beforeEach(() => {
  process.env.ENCRYPTION_KEY_V1 = VALID_KEY
})

function buildEncryptedRow(
  profileId: string,
  pageId: string,
  input: Partial<SitePageWrite> = {},
): SitePageEncryptedRow {
  const write: SitePageWrite = {
    profile_id: profileId,
    site_id: input.site_id ?? SITE_ID,
    url: input.url ?? "https://clinic.example.com/treatments/knee",
    title: input.title ?? "Knee Pain Treatments",
    compliance_score: input.compliance_score ?? 82,
    flag_count: input.flag_count ?? 1,
    high_risk_count: input.high_risk_count ?? 0,
    medium_risk_count: input.medium_risk_count ?? 1,
    low_risk_count: input.low_risk_count ?? 0,
    last_scan_id: input.last_scan_id ?? null,
    last_scanned_at: input.last_scanned_at ?? null,
    status: input.status ?? "active",
  }
  const insert = encryptSitePageWrite(profileId, write, pageId)
  return {
    id: pageId,
    site_id: insert.site_id,
    profile_id: profileId,
    url_enc: insert.url_enc,
    title_enc: insert.title_enc,
    compliance_score: insert.compliance_score ?? null,
    flag_count: insert.flag_count ?? 0,
    high_risk_count: insert.high_risk_count ?? 0,
    medium_risk_count: insert.medium_risk_count ?? 0,
    low_risk_count: insert.low_risk_count ?? 0,
    last_scan_id: insert.last_scan_id ?? null,
    last_scanned_at: insert.last_scanned_at ?? null,
    status: insert.status ?? null,
    last_error: insert.last_error ?? null,
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

describe("lib/repos/site-pages - pure transforms", () => {
  it("roundtrips url + title via encryptSitePageWrite -> decryptSitePageRow", () => {
    const row = buildEncryptedRow(PROFILE_A, PAGE_ID, {
      url: "https://clinic.example.com/x",
      title: "X Page",
    })
    const page = decryptSitePageRow(PROFILE_A, row)
    expect(page.url).toBe("https://clinic.example.com/x")
    expect(page.title).toBe("X Page")
    expect(page.profile_id).toBe(PROFILE_A)
    expect(page.site_id).toBe(SITE_ID)
  })

  it("NULL title_enc decrypts to null", () => {
    const base = buildEncryptedRow(PROFILE_A, PAGE_ID)
    const row: SitePageEncryptedRow = { ...base, title_enc: null }
    const page = decryptSitePageRow(PROFILE_A, row)
    expect(page.title).toBeNull()
  })

  it("AAD binding: row id swap breaks decrypt", () => {
    const row = buildEncryptedRow(PROFILE_A, PAGE_ID)
    const tampered: SitePageEncryptedRow = { ...row, id: PAGE_ID_OTHER }
    expect(() => decryptSitePageRow(PROFILE_A, tampered)).toThrow(/Decrypt failed/)
  })

  it("cross-profile decrypt fails", () => {
    const row = buildEncryptedRow(PROFILE_A, PAGE_ID)
    expect(() => decryptSitePageRow(PROFILE_B, row)).toThrow(/Decrypt failed/)
  })
})

describe("lib/repos/site-pages - createSitePage", () => {
  it("encrypts url + title; no plaintext leaks", async () => {
    const row = buildEncryptedRow(PROFILE_A, PAGE_ID)
    const { client, calls } = makeMockSupabase({
      insertResult: { data: row, error: null },
    })

    const page = await createSitePage(client, {
      id: PAGE_ID,
      profile_id: PROFILE_A,
      site_id: SITE_ID,
      url: "https://clinic.example.com/treatments/knee",
      title: "Knee Pain Treatments",
      status: "active",
    })

    expect(page.url).toBe("https://clinic.example.com/treatments/knee")

    const payload = calls.insertPayload as Record<string, unknown>
    expect(payload.url_enc).toMatch(/^v1u\./)
    expect(payload.title_enc).toMatch(/^v1u\./)
    expect(payload).not.toHaveProperty("url")
    expect(payload).not.toHaveProperty("title")
    expect(payload.profile_id).toBe(PROFILE_A)
    expect(payload.site_id).toBe(SITE_ID)
    expect(payload.status).toBe("active")
  })
})

describe("lib/repos/site-pages - getSitePage", () => {
  it("requires explicit profileId filter and decrypts row", async () => {
    const row = buildEncryptedRow(PROFILE_A, PAGE_ID)
    const { client, calls } = makeMockSupabase({
      selectResult: { data: row, error: null },
    })

    const page = await getSitePage(client, PROFILE_A, PAGE_ID)
    expect(page!.url).toBe("https://clinic.example.com/treatments/knee")
    expect(calls.eqFilters).toContainEqual(["id", PAGE_ID])
    expect(calls.eqFilters).toContainEqual(["profile_id", PROFILE_A])
  })
})

describe("lib/repos/site-pages - updateSitePage", () => {
  it("updates only title_enc when patching title alone", async () => {
    const updated = buildEncryptedRow(PROFILE_A, PAGE_ID, { title: "New Title" })
    const { client, calls } = makeMockSupabase({
      updateResult: { data: updated, error: null },
    })

    const page = await updateSitePage(client, PROFILE_A, PAGE_ID, { title: "New Title" })
    expect(page.title).toBe("New Title")

    const payload = calls.updatePayload as Record<string, unknown>
    expect(payload.title_enc).toMatch(/^v1u\./)
    expect(payload).not.toHaveProperty("url_enc")
  })

  it("updates scalar fields without touching encrypted columns", async () => {
    const updated = buildEncryptedRow(PROFILE_A, PAGE_ID)
    updated.compliance_score = 95
    const { client, calls } = makeMockSupabase({
      updateResult: { data: updated, error: null },
    })

    await updateSitePage(client, PROFILE_A, PAGE_ID, { compliance_score: 95, status: "active" })
    const payload = calls.updatePayload as Record<string, unknown>
    expect(payload).not.toHaveProperty("url_enc")
    expect(payload).not.toHaveProperty("title_enc")
    expect(payload.compliance_score).toBe(95)
    expect(payload.status).toBe("active")
  })
})

describe("lib/repos/site-pages - listPagesForSite", () => {
  it("decrypts every row in a list response", async () => {
    const r1 = buildEncryptedRow(PROFILE_A, PAGE_ID, { url: "https://a.example.com" })
    const r2 = buildEncryptedRow(PROFILE_A, PAGE_ID_OTHER, { url: "https://b.example.com" })
    const { client, calls } = makeMockSupabase({
      selectResult: { data: [r1, r2], error: null, count: 2 },
    })

    const result = await listPagesForSite(client, PROFILE_A, SITE_ID, { limit: 10 })
    expect(result.count).toBe(2)
    expect(result.pages[0].url).toBe("https://a.example.com")
    expect(result.pages[1].url).toBe("https://b.example.com")
    expect(calls.eqFilters).toContainEqual(["profile_id", PROFILE_A])
    expect(calls.eqFilters).toContainEqual(["site_id", SITE_ID])
  })
})

describe("lib/repos/site-pages - getSitePageForAdmin", () => {
  it("decrypts via the row's denormalized profile_id", async () => {
    const row = buildEncryptedRow(PROFILE_A, PAGE_ID)
    const { client, calls } = makeMockSupabase({
      selectResult: { data: row, error: null },
    })

    const page = await getSitePageForAdmin(client, PAGE_ID)
    expect(page!.url).toBe("https://clinic.example.com/treatments/knee")
    expect(calls.eqFilters.find(([k]) => k === "profile_id")).toBeUndefined()
  })
})
