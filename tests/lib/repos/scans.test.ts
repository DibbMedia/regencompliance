import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  createScan,
  decryptScanRow,
  encryptScanWrite,
  getScan,
  getScanForAdmin,
  listScans,
  updateScanRewrite,
  type ScanEncryptedRow,
  type ScanWrite,
} from "@/lib/repos/scans"
import type { ScanFlag } from "@/lib/types"

const VALID_KEY = "a".repeat(64)

const PROFILE_A = "11111111-1111-4111-8111-111111111111"
const PROFILE_B = "22222222-2222-4222-8222-222222222222"
const SCAN_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
const SCAN_ID_OTHER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"

beforeAll(() => {
  process.env.ENCRYPTION_KEY_V1 = VALID_KEY
})

beforeEach(() => {
  process.env.ENCRYPTION_KEY_V1 = VALID_KEY
})

const sampleFlags: ScanFlag[] = [
  {
    rule_id: "rule-1",
    matched_text: "FDA approved",
    banned_phrase: "FDA approved",
    risk_level: "high",
    reason: "Not approved by FDA",
    alternative: "FDA cleared",
  },
  {
    rule_id: "rule-2",
    matched_text: "cure",
    banned_phrase: "cure",
    risk_level: "medium",
    reason: "Outcome claim",
    alternative: "may help",
  },
]

function buildEncryptedRow(profileId: string, scanId: string, input: Partial<ScanWrite> = {}): ScanEncryptedRow {
  const write: ScanWrite = {
    profile_id: profileId,
    content_type: input.content_type ?? "website",
    original_text: input.original_text ?? "Our treatment is FDA approved and will cure you.",
    rewritten_text: input.rewritten_text ?? null,
    flags: input.flags ?? sampleFlags,
    source_url: input.source_url ?? "https://example.com/treatments",
    compliance_score: input.compliance_score ?? 42,
    flag_count: input.flag_count ?? 2,
    high_risk_count: input.high_risk_count ?? 1,
    medium_risk_count: input.medium_risk_count ?? 1,
    low_risk_count: input.low_risk_count ?? 0,
    scan_duration_ms: input.scan_duration_ms ?? 1234,
  }
  const insert = encryptScanWrite(profileId, write, scanId)
  return {
    id: scanId,
    profile_id: profileId,
    user_id: null,
    content_type: insert.content_type,
    original_text_enc: insert.original_text_enc,
    rewritten_text_enc: insert.rewritten_text_enc,
    flags_enc: insert.flags_enc,
    source_url_enc: insert.source_url_enc,
    compliance_score: insert.compliance_score ?? null,
    flag_count: insert.flag_count ?? 0,
    high_risk_count: insert.high_risk_count ?? 0,
    medium_risk_count: insert.medium_risk_count ?? 0,
    low_risk_count: insert.low_risk_count ?? 0,
    scan_duration_ms: insert.scan_duration_ms ?? null,
    created_at: "2026-05-13T00:00:00Z",
  }
}

/**
 * Minimal chainable Supabase mock. Records the last insert/update payload
 * and the final eq() filters; resolves to whatever the test pre-loaded.
 */
function makeMockSupabase(opts: {
  selectResult?: { data: unknown; error: unknown; count?: number }
  insertResult?: { data: unknown; error: unknown }
  updateResult?: { data: unknown; error: unknown }
} = {}) {
  const calls: {
    insertPayload?: unknown
    updatePayload?: unknown
    table?: string
    selectCols?: string
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
  builder.select = vi.fn((cols: string, _opts?: { count?: string }) => {
    calls.selectCols = cols
    if (!calls.op) calls.op = "select"
    return builder
  })
  builder.insert = vi.fn((payload: unknown) => {
    calls.op = "insert"
    calls.insertPayload = payload
    return builder
  })
  builder.update = vi.fn((payload: unknown) => {
    calls.op = "update"
    calls.updatePayload = payload
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
  // listScans path awaits the builder directly (no .single).
  builder.then = (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
    resolver().then(onFulfilled, onRejected)

  return { client: builder as unknown as SupabaseClient, calls }
}

describe("lib/repos/scans - pure transforms", () => {
  it("roundtrips a full scan via encryptScanWrite -> decryptScanRow", () => {
    const row = buildEncryptedRow(PROFILE_A, SCAN_ID, {
      original_text: "Stem cells will cure your knee.",
      rewritten_text: "Stem cells may help your knee.",
      flags: sampleFlags,
      source_url: "https://example.com/knee",
    })
    const scan = decryptScanRow(PROFILE_A, row)

    expect(scan.id).toBe(SCAN_ID)
    expect(scan.profile_id).toBe(PROFILE_A)
    expect(scan.original_text).toBe("Stem cells will cure your knee.")
    expect(scan.rewritten_text).toBe("Stem cells may help your knee.")
    expect(scan.source_url).toBe("https://example.com/knee")
    expect(scan.flags).toEqual(sampleFlags)
    expect(scan.flag_count).toBe(2)
  })

  it("decrypts the JSON flags array correctly", () => {
    const row = buildEncryptedRow(PROFILE_A, SCAN_ID, { flags: sampleFlags })
    const scan = decryptScanRow(PROFILE_A, row)
    expect(scan.flags).toHaveLength(2)
    expect(scan.flags[0].rule_id).toBe("rule-1")
    expect(scan.flags[1].risk_level).toBe("medium")
  })

  it("NULL ciphertext columns decrypt to null/empty plaintext", () => {
    const base = buildEncryptedRow(PROFILE_A, SCAN_ID)
    const row: ScanEncryptedRow = {
      ...base,
      rewritten_text_enc: null,
      source_url_enc: null,
      flags_enc: null,
    }
    const scan = decryptScanRow(PROFILE_A, row)
    expect(scan.rewritten_text).toBeNull()
    expect(scan.source_url).toBeNull()
    expect(scan.flags).toEqual([])
  })

  it("AAD binding: swapping row id breaks decrypt", () => {
    const row = buildEncryptedRow(PROFILE_A, SCAN_ID)
    const tampered: ScanEncryptedRow = { ...row, id: SCAN_ID_OTHER }
    expect(() => decryptScanRow(PROFILE_A, tampered)).toThrow(/Decrypt failed/)
  })

  it("cross-profile decrypt fails", () => {
    const row = buildEncryptedRow(PROFILE_A, SCAN_ID)
    expect(() => decryptScanRow(PROFILE_B, row)).toThrow(/Decrypt failed/)
  })
})

describe("lib/repos/scans - createScan", () => {
  it("encrypts every text field on insert; no plaintext leaks into the insert payload", async () => {
    const id = SCAN_ID
    const finalRow = buildEncryptedRow(PROFILE_A, id, {
      original_text: "FDA approved miracle",
      rewritten_text: null,
      flags: sampleFlags,
      source_url: "https://example.com",
    })
    const { client, calls } = makeMockSupabase({
      insertResult: { data: finalRow, error: null },
    })

    const scan = await createScan(client, {
      id,
      profile_id: PROFILE_A,
      content_type: "website",
      original_text: "FDA approved miracle",
      flags: sampleFlags,
      source_url: "https://example.com",
      compliance_score: 30,
      flag_count: 2,
      high_risk_count: 1,
      medium_risk_count: 1,
      low_risk_count: 0,
    })

    expect(scan.original_text).toBe("FDA approved miracle")

    const payload = calls.insertPayload as Record<string, unknown>
    expect(payload).toBeTruthy()
    // Encrypted columns must look like v1u. envelopes.
    expect(payload.original_text_enc).toMatch(/^v1u\./)
    expect(payload.flags_enc).toMatch(/^v1u\./)
    expect(payload.source_url_enc).toMatch(/^v1u\./)
    // No plaintext columns at all.
    expect(payload).not.toHaveProperty("original_text")
    expect(payload).not.toHaveProperty("rewritten_text")
    expect(payload).not.toHaveProperty("flags")
    expect(payload).not.toHaveProperty("source_url")
    // Pass-through values preserved.
    expect(payload.profile_id).toBe(PROFILE_A)
    expect(payload.content_type).toBe("website")
    expect(payload.compliance_score).toBe(30)
    expect(payload.flag_count).toBe(2)
  })
})

describe("lib/repos/scans - getScan", () => {
  it("decrypts a single scan and verifies flags JSON", async () => {
    const row = buildEncryptedRow(PROFILE_A, SCAN_ID, { flags: sampleFlags })
    const { client, calls } = makeMockSupabase({
      selectResult: { data: row, error: null },
    })

    const scan = await getScan(client, PROFILE_A, SCAN_ID)
    expect(scan).not.toBeNull()
    expect(scan!.id).toBe(SCAN_ID)
    expect(scan!.flags).toEqual(sampleFlags)
    expect(scan!.original_text).toContain("FDA approved")

    // Filters applied
    expect(calls.eqFilters).toContainEqual(["id", SCAN_ID])
    expect(calls.eqFilters).toContainEqual(["profile_id", PROFILE_A])
  })

  it("returns null when row is missing", async () => {
    const { client } = makeMockSupabase({
      selectResult: { data: null, error: null },
    })
    const scan = await getScan(client, PROFILE_A, SCAN_ID)
    expect(scan).toBeNull()
  })
})

describe("lib/repos/scans - updateScanRewrite", () => {
  it("updates only rewritten_text_enc, not other encrypted columns", async () => {
    const updatedRow = buildEncryptedRow(PROFILE_A, SCAN_ID, {
      rewritten_text: "Polished compliant copy",
    })
    const { client, calls } = makeMockSupabase({
      updateResult: { data: updatedRow, error: null },
    })

    const scan = await updateScanRewrite(client, PROFILE_A, SCAN_ID, "Polished compliant copy")
    expect(scan.rewritten_text).toBe("Polished compliant copy")

    const payload = calls.updatePayload as Record<string, unknown>
    expect(payload).toBeTruthy()
    expect(Object.keys(payload)).toEqual(["rewritten_text_enc"])
    expect(payload.rewritten_text_enc).toMatch(/^v1u\./)
    // Not touched
    expect(payload).not.toHaveProperty("original_text_enc")
    expect(payload).not.toHaveProperty("flags_enc")
    expect(payload).not.toHaveProperty("source_url_enc")
  })
})

describe("lib/repos/scans - listScans", () => {
  it("decrypts every row in a list response", async () => {
    const row1 = buildEncryptedRow(PROFILE_A, SCAN_ID, {
      original_text: "First scan",
      flags: sampleFlags,
    })
    const row2 = buildEncryptedRow(PROFILE_A, SCAN_ID_OTHER, {
      original_text: "Second scan",
      flags: [],
    })
    const { client } = makeMockSupabase({
      selectResult: { data: [row1, row2], error: null, count: 2 },
    })

    const result = await listScans(client, PROFILE_A, { limit: 10, offset: 0 })
    expect(result.count).toBe(2)
    expect(result.scans).toHaveLength(2)
    expect(result.scans[0].original_text).toBe("First scan")
    expect(result.scans[0].flags).toEqual(sampleFlags)
    expect(result.scans[1].original_text).toBe("Second scan")
    expect(result.scans[1].flags).toEqual([])
  })
})

describe("lib/repos/scans - getScanForAdmin", () => {
  it("decrypts via the row's own profile_id (no caller-supplied profileId)", async () => {
    const row = buildEncryptedRow(PROFILE_A, SCAN_ID)
    const { client, calls } = makeMockSupabase({
      selectResult: { data: row, error: null },
    })

    const scan = await getScanForAdmin(client, SCAN_ID)
    expect(scan).not.toBeNull()
    expect(scan!.profile_id).toBe(PROFILE_A)
    expect(scan!.original_text).toContain("FDA approved")
    // No profile_id filter in the admin query (id only).
    expect(calls.eqFilters.find(([k]) => k === "profile_id")).toBeUndefined()
  })
})
