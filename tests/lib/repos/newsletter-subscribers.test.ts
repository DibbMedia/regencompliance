import { describe, it, expect, beforeAll, beforeEach } from "vitest"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  createNewsletterSubscriber,
  decryptNewsletterSubscriberRow,
  deleteNewsletterSubscriber,
  encryptNewsletterSubscriberWrite,
  getNewsletterSubscriber,
  listNewsletterSubscribersForAdmin,
  type NewsletterSubscriberEncryptedRow,
} from "@/lib/repos/newsletter-subscribers"
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
  email: "reader@example.com",
  ip_address: "10.0.0.1",
  user_agent: "TestUA",
  source: "blog",
  source_slug: "fda-letters-2026",
}

describe("lib/repos/newsletter-subscribers - transforms", () => {
  it("roundtrips encrypt -> decrypt", () => {
    const rowId = "11111111-1111-4111-8111-111111111111"
    const enc = encryptNewsletterSubscriberWrite(sampleInput, rowId)
    const encRow: NewsletterSubscriberEncryptedRow = {
      id: rowId,
      email_enc: enc.email_enc,
      ip_address_enc: enc.ip_address_enc,
      user_agent_enc: enc.user_agent_enc,
      source: enc.source,
      source_slug: enc.source_slug,
      created_at: "2026-05-13T00:00:00Z",
    }
    const dec = decryptNewsletterSubscriberRow(encRow)
    expect(dec.email).toBe(sampleInput.email)
    expect(dec.ip_address).toBe(sampleInput.ip_address)
    expect(dec.user_agent).toBe(sampleInput.user_agent)
    expect(dec.source).toBe("blog")
    expect(dec.source_slug).toBe("fda-letters-2026")
  })

  it("handles NULL optional fields", () => {
    const rowId = "22222222-2222-4222-8222-222222222222"
    const enc = encryptNewsletterSubscriberWrite({ email: "x@y.com" }, rowId)
    expect(enc.ip_address_enc).toBeNull()
    expect(enc.user_agent_enc).toBeNull()
    expect(enc.source).toBeNull()
    expect(enc.source_slug).toBeNull()
    const dec = decryptNewsletterSubscriberRow({
      id: rowId,
      email_enc: enc.email_enc,
      ip_address_enc: null,
      user_agent_enc: null,
      source: null,
      source_slug: null,
      created_at: "2026-05-13T00:00:00Z",
    })
    expect(dec.email).toBe("x@y.com")
    expect(dec.ip_address).toBeNull()
    expect(dec.source_slug).toBeNull()
  })

  it("AAD binding: row A ciphertext fails for row B", () => {
    const rowA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
    const rowB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
    const enc = encryptNewsletterSubscriberWrite(sampleInput, rowA)
    expect(() =>
      decryptNewsletterSubscriberRow({
        id: rowB,
        email_enc: enc.email_enc,
        ip_address_enc: enc.ip_address_enc,
        user_agent_enc: enc.user_agent_enc,
        source: enc.source,
        source_slug: enc.source_slug,
        created_at: "2026-05-13T00:00:00Z",
      }),
    ).toThrow()
  })
})

describe("lib/repos/newsletter-subscribers - create/get/list", () => {
  it("createNewsletterSubscriber encrypts: no plaintext PII in insert payload", async () => {
    const out = await createNewsletterSubscriber(supabase, sampleInput)
    expect(out.email).toBe(sampleInput.email)
    const insert = db.calls.find((c) => c.op === "insert")!
    const p = insert.payload as Record<string, unknown>
    expect((p.email_enc as string).startsWith("v1r.")).toBe(true)
    expect((p.ip_address_enc as string).startsWith("v1r.")).toBe(true)
    expect((p.user_agent_enc as string).startsWith("v1r.")).toBe(true)
    expect(p.email).toBeUndefined()
    expect(p.ip_address).toBeUndefined()
    // Plaintext aggregates remain
    expect(p.source).toBe("blog")
    expect(p.source_slug).toBe("fda-letters-2026")
    for (const v of Object.values(p)) {
      if (typeof v === "string") {
        expect(v).not.toBe(sampleInput.email)
      }
    }
  })

  it("getNewsletterSubscriber decrypts", async () => {
    const c = await createNewsletterSubscriber(supabase, sampleInput)
    const f = await getNewsletterSubscriber(supabase, c.id)
    expect(f).not.toBeNull()
    expect(f!.email).toBe(sampleInput.email)
  })

  it("listNewsletterSubscribersForAdmin decrypts every row", async () => {
    await createNewsletterSubscriber(supabase, { ...sampleInput, email: "a@z.com" })
    await createNewsletterSubscriber(supabase, { ...sampleInput, email: "b@z.com" })
    const list = await listNewsletterSubscribersForAdmin(supabase)
    expect(list).toHaveLength(2)
    expect(list.map((r) => r.email).sort()).toEqual(["a@z.com", "b@z.com"])
  })

  it("deleteNewsletterSubscriber removes the row", async () => {
    const c = await createNewsletterSubscriber(supabase, sampleInput)
    await deleteNewsletterSubscriber(supabase, c.id)
    expect(await getNewsletterSubscriber(supabase, c.id)).toBeNull()
  })
})
