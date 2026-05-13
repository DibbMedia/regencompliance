import { describe, it, expect, beforeAll, beforeEach } from "vitest"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  createBetaApplication,
  decryptBetaApplicationRow,
  deleteBetaApplication,
  encryptBetaApplicationWrite,
  getBetaApplication,
  listBetaApplicationsForAdmin,
  type BetaApplicationEncryptedRow,
} from "@/lib/repos/beta-applications"
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

const sampleInput = {
  name: "Jane Doe",
  email: "jane@clinic.com",
  clinic_name: "Acme Clinic",
  specialty: "Orthopedics",
  role: "Founder",
  website: "https://acme.example",
  monthly_volume: "100-500",
  why_apply: "We want to ship safe copy",
  ip_address: "1.2.3.4",
  user_agent: "Mozilla",
  source: "apply-page",
}

describe("lib/repos/beta-applications - transforms", () => {
  it("roundtrips encrypt -> decrypt", () => {
    const rowId = "11111111-1111-4111-8111-111111111111"
    const enc = encryptBetaApplicationWrite(sampleInput, rowId)
    const encRow: BetaApplicationEncryptedRow = {
      id: rowId,
      name_enc: enc.name_enc,
      email_enc: enc.email_enc,
      clinic_name_enc: enc.clinic_name_enc,
      specialty_enc: enc.specialty_enc,
      role_enc: enc.role_enc,
      website_enc: enc.website_enc,
      monthly_volume_enc: enc.monthly_volume_enc,
      why_apply_enc: enc.why_apply_enc,
      ip_address_enc: enc.ip_address_enc,
      user_agent_enc: enc.user_agent_enc,
      source: enc.source,
      accepted_terms_at: "2026-05-13T00:00:00Z",
      created_at: "2026-05-13T00:00:00Z",
    }
    const dec = decryptBetaApplicationRow(encRow)
    expect(dec.name).toBe(sampleInput.name)
    expect(dec.email).toBe(sampleInput.email)
    expect(dec.clinic_name).toBe(sampleInput.clinic_name)
    expect(dec.specialty).toBe(sampleInput.specialty)
    expect(dec.role).toBe(sampleInput.role)
    expect(dec.website).toBe(sampleInput.website)
    expect(dec.monthly_volume).toBe(sampleInput.monthly_volume)
    expect(dec.why_apply).toBe(sampleInput.why_apply)
    expect(dec.ip_address).toBe(sampleInput.ip_address)
    expect(dec.user_agent).toBe(sampleInput.user_agent)
  })

  it("handles NULL optional fields (website, ip, ua, source)", () => {
    const rowId = "22222222-2222-4222-8222-222222222222"
    const enc = encryptBetaApplicationWrite(
      {
        name: "n",
        email: "e@x.com",
        clinic_name: "c",
        specialty: "s",
        role: "r",
        monthly_volume: "mv",
        why_apply: "wa",
      },
      rowId,
    )
    expect(enc.website_enc).toBeNull()
    expect(enc.ip_address_enc).toBeNull()
    expect(enc.user_agent_enc).toBeNull()
    expect(enc.source).toBeNull()
  })

  it("AAD binding: row A ciphertext fails for row B", () => {
    const rowA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
    const rowB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
    const enc = encryptBetaApplicationWrite(sampleInput, rowA)
    expect(() =>
      decryptBetaApplicationRow({
        id: rowB,
        name_enc: enc.name_enc,
        email_enc: enc.email_enc,
        clinic_name_enc: enc.clinic_name_enc,
        specialty_enc: enc.specialty_enc,
        role_enc: enc.role_enc,
        website_enc: enc.website_enc,
        monthly_volume_enc: enc.monthly_volume_enc,
        why_apply_enc: enc.why_apply_enc,
        ip_address_enc: enc.ip_address_enc,
        user_agent_enc: enc.user_agent_enc,
        source: enc.source,
        accepted_terms_at: "2026-05-13T00:00:00Z",
        created_at: "2026-05-13T00:00:00Z",
      }),
    ).toThrow()
  })
})

describe("lib/repos/beta-applications - create/get/list", () => {
  it("createBetaApplication encrypts: no plaintext PII in insert payload", async () => {
    const out = await createBetaApplication(supabase, sampleInput)
    expect(out.email).toBe(sampleInput.email)
    const insert = db.calls.find((c) => c.op === "insert")!
    const p = insert.payload as Record<string, unknown>
    for (const col of [
      "name_enc",
      "email_enc",
      "clinic_name_enc",
      "specialty_enc",
      "role_enc",
      "website_enc",
      "monthly_volume_enc",
      "why_apply_enc",
      "ip_address_enc",
      "user_agent_enc",
    ]) {
      expect((p[col] as string).startsWith("v1r.")).toBe(true)
    }
    // No plaintext on payload
    expect(p.email).toBeUndefined()
    expect(p.name).toBeUndefined()
    expect(p.clinic_name).toBeUndefined()
    expect(p.why_apply).toBeUndefined()
    // Source stays plain
    expect(p.source).toBe("apply-page")
    // Spot-check no payload string equals a plaintext PII value
    for (const v of Object.values(p)) {
      if (typeof v === "string") {
        expect(v).not.toBe(sampleInput.email)
        expect(v).not.toBe(sampleInput.why_apply)
        expect(v).not.toBe(sampleInput.clinic_name)
      }
    }
  })

  it("getBetaApplication decrypts", async () => {
    const c = await createBetaApplication(supabase, sampleInput)
    const f = await getBetaApplication(supabase, c.id)
    expect(f).not.toBeNull()
    expect(f!.email).toBe(sampleInput.email)
    expect(f!.clinic_name).toBe(sampleInput.clinic_name)
  })

  it("listBetaApplicationsForAdmin decrypts every row", async () => {
    await createBetaApplication(supabase, { ...sampleInput, email: "a@c.com" })
    await createBetaApplication(supabase, { ...sampleInput, email: "b@c.com" })
    const list = await listBetaApplicationsForAdmin(supabase)
    expect(list).toHaveLength(2)
    const emails = list.map((r) => r.email).sort()
    expect(emails).toEqual(["a@c.com", "b@c.com"])
    for (const r of list) {
      expect(r.clinic_name).toBe(sampleInput.clinic_name)
    }
  })

  it("deleteBetaApplication removes the row", async () => {
    const c = await createBetaApplication(supabase, sampleInput)
    await deleteBetaApplication(supabase, c.id)
    expect(await getBetaApplication(supabase, c.id)).toBeNull()
  })
})
