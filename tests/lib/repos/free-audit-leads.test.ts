import { describe, it, expect, beforeAll, beforeEach } from "vitest"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  createFreeAuditLead,
  decryptFreeAuditLeadRow,
  deleteFreeAuditLead,
  encryptFreeAuditLeadWrite,
  getFreeAuditLead,
  listFreeAuditLeadsForAdmin,
  type FreeAuditLeadEncryptedRow,
} from "@/lib/repos/free-audit-leads"
import { makeMockSupabase, type MockDb } from "./_mock-supabase"

const VALID_KEY = "a".repeat(64)

beforeAll(() => {
  process.env.ENCRYPTION_KEY_V1 = VALID_KEY
})

let db: MockDb
let supabase: SupabaseClient
beforeEach(() => {
  db = { calls: [], rows: new Map() }
  supabase = makeMockSupabase(db)
})

const sampleFlags = {
  violations: [
    { severity: "high", text: "Cures cancer" },
    { severity: "medium", text: "Guaranteed results" },
  ],
}

const sampleInput = {
  email: "prospect@clinic.com",
  website_url: "https://acme.example/services",
  page_title: "Services - Acme",
  compliance_score: 42,
  flag_count: 5,
  high_risk_count: 2,
  medium_risk_count: 2,
  low_risk_count: 1,
  flags: sampleFlags,
  ip_address: "9.9.9.9",
  user_agent: "TestUA",
  source: "free-audit",
}

describe("lib/repos/free-audit-leads - transforms", () => {
  it("roundtrips encrypt -> decrypt incl. JSONB flags", () => {
    const rowId = "11111111-1111-4111-8111-111111111111"
    const enc = encryptFreeAuditLeadWrite(sampleInput, rowId)
    const encRow: FreeAuditLeadEncryptedRow = {
      id: rowId,
      email_enc: enc.email_enc,
      website_url_enc: enc.website_url_enc,
      page_title_enc: enc.page_title_enc,
      compliance_score: enc.compliance_score,
      flag_count: enc.flag_count,
      high_risk_count: enc.high_risk_count,
      medium_risk_count: enc.medium_risk_count,
      low_risk_count: enc.low_risk_count,
      flags_enc: enc.flags_enc,
      ip_address_enc: enc.ip_address_enc,
      user_agent_enc: enc.user_agent_enc,
      source: enc.source,
      created_at: "2026-05-13T00:00:00Z",
    }
    const dec = decryptFreeAuditLeadRow(encRow)
    expect(dec.email).toBe(sampleInput.email)
    expect(dec.website_url).toBe(sampleInput.website_url)
    expect(dec.page_title).toBe(sampleInput.page_title)
    expect(dec.compliance_score).toBe(42)
    expect(dec.high_risk_count).toBe(2)
    expect(dec.flags).toEqual(sampleFlags)
    expect(dec.ip_address).toBe(sampleInput.ip_address)
  })

  it("handles NULL optional fields incl. flags", () => {
    const rowId = "22222222-2222-4222-8222-222222222222"
    const enc = encryptFreeAuditLeadWrite(
      { email: "x@y.com", website_url: "https://x.y" },
      rowId,
    )
    expect(enc.page_title_enc).toBeNull()
    expect(enc.flags_enc).toBeNull()
    expect(enc.ip_address_enc).toBeNull()
    expect(enc.user_agent_enc).toBeNull()
    expect(enc.compliance_score).toBeNull()
    const dec = decryptFreeAuditLeadRow({
      id: rowId,
      email_enc: enc.email_enc,
      website_url_enc: enc.website_url_enc,
      page_title_enc: null,
      compliance_score: null,
      flag_count: null,
      high_risk_count: null,
      medium_risk_count: null,
      low_risk_count: null,
      flags_enc: null,
      ip_address_enc: null,
      user_agent_enc: null,
      source: null,
      created_at: "2026-05-13T00:00:00Z",
    })
    expect(dec.flags).toBeNull()
    expect(dec.page_title).toBeNull()
  })

  it("AAD binding: row A ciphertext fails for row B (incl. flags JSON)", () => {
    const rowA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
    const rowB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
    const enc = encryptFreeAuditLeadWrite(sampleInput, rowA)
    expect(() =>
      decryptFreeAuditLeadRow({
        id: rowB,
        email_enc: enc.email_enc,
        website_url_enc: enc.website_url_enc,
        page_title_enc: enc.page_title_enc,
        compliance_score: enc.compliance_score,
        flag_count: enc.flag_count,
        high_risk_count: enc.high_risk_count,
        medium_risk_count: enc.medium_risk_count,
        low_risk_count: enc.low_risk_count,
        flags_enc: enc.flags_enc,
        ip_address_enc: enc.ip_address_enc,
        user_agent_enc: enc.user_agent_enc,
        source: enc.source,
        created_at: "2026-05-13T00:00:00Z",
      }),
    ).toThrow()
  })
})

describe("lib/repos/free-audit-leads - create/get/list", () => {
  it("createFreeAuditLead encrypts: no plaintext PII or flags in insert payload", async () => {
    const out = await createFreeAuditLead(supabase, sampleInput)
    expect(out.email).toBe(sampleInput.email)
    const insert = db.calls.find((c) => c.op === "insert")!
    const p = insert.payload as Record<string, unknown>
    for (const col of [
      "email_enc",
      "website_url_enc",
      "page_title_enc",
      "flags_enc",
      "ip_address_enc",
      "user_agent_enc",
    ]) {
      expect((p[col] as string).startsWith("v1r.")).toBe(true)
    }
    expect(p.email).toBeUndefined()
    expect(p.website_url).toBeUndefined()
    expect(p.page_title).toBeUndefined()
    expect(p.flags).toBeUndefined()
    expect(p.ip_address).toBeUndefined()
    expect(p.user_agent).toBeUndefined()
    // Aggregate counts stay plaintext
    expect(p.compliance_score).toBe(42)
    expect(p.high_risk_count).toBe(2)
    expect(p.flag_count).toBe(5)
    // Spot-check no payload value equals a plaintext PII string
    for (const v of Object.values(p)) {
      if (typeof v === "string") {
        expect(v).not.toBe(sampleInput.email)
        expect(v).not.toBe(sampleInput.website_url)
        expect(v).not.toContain("Cures cancer")
      }
    }
  })

  it("getFreeAuditLead decrypts incl. flags", async () => {
    const c = await createFreeAuditLead(supabase, sampleInput)
    const f = await getFreeAuditLead(supabase, c.id)
    expect(f).not.toBeNull()
    expect(f!.email).toBe(sampleInput.email)
    expect(f!.flags).toEqual(sampleFlags)
  })

  it("listFreeAuditLeadsForAdmin decrypts every row", async () => {
    await createFreeAuditLead(supabase, { ...sampleInput, email: "a@y.com" })
    await createFreeAuditLead(supabase, { ...sampleInput, email: "b@y.com" })
    const list = await listFreeAuditLeadsForAdmin(supabase)
    expect(list).toHaveLength(2)
    const emails = list.map((r) => r.email).sort()
    expect(emails).toEqual(["a@y.com", "b@y.com"])
    for (const r of list) {
      expect(r.flags).toEqual(sampleFlags)
    }
  })

  it("deleteFreeAuditLead removes the row", async () => {
    const c = await createFreeAuditLead(supabase, sampleInput)
    await deleteFreeAuditLead(supabase, c.id)
    expect(await getFreeAuditLead(supabase, c.id)).toBeNull()
  })
})
