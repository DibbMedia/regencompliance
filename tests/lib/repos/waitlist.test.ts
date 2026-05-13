import { describe, it, expect, beforeAll, beforeEach } from "vitest"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  createWaitlistEntry,
  decryptWaitlistRow,
  deleteWaitlistEntry,
  encryptWaitlistWrite,
  getWaitlistEntry,
  listUnsentWaitlist,
  listWaitlistForAdmin,
  markWaitlistLaunchSent,
  type WaitlistEncryptedRow,
} from "@/lib/repos/waitlist"
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

describe("lib/repos/waitlist - transforms", () => {
  it("roundtrips encrypt -> decrypt via transforms", () => {
    const rowId = "11111111-1111-4111-8111-111111111111"
    const enc = encryptWaitlistWrite(
      {
        email: "ada@example.com",
        name: "Ada",
        ip_address: "1.2.3.4",
        user_agent: "Mozilla",
        source: "blog",
      },
      rowId,
    )
    const encRow: WaitlistEncryptedRow = {
      id: rowId,
      email_enc: enc.email_enc,
      name_enc: enc.name_enc,
      ip_address_enc: enc.ip_address_enc,
      user_agent_enc: enc.user_agent_enc,
      source: enc.source,
      created_at: "2026-05-13T00:00:00Z",
      launch_email_sent_at: null,
    }
    const dec = decryptWaitlistRow(encRow)
    expect(dec.email).toBe("ada@example.com")
    expect(dec.name).toBe("Ada")
    expect(dec.ip_address).toBe("1.2.3.4")
    expect(dec.user_agent).toBe("Mozilla")
    expect(dec.source).toBe("blog")
  })

  it("handles NULL optional fields", () => {
    const rowId = "22222222-2222-4222-8222-222222222222"
    const enc = encryptWaitlistWrite({ email: "only@example.com" }, rowId)
    expect(enc.name_enc).toBeNull()
    expect(enc.ip_address_enc).toBeNull()
    expect(enc.user_agent_enc).toBeNull()
    expect(enc.source).toBeNull()
    const dec = decryptWaitlistRow({
      id: rowId,
      email_enc: enc.email_enc,
      name_enc: null,
      ip_address_enc: null,
      user_agent_enc: null,
      source: null,
      created_at: "2026-05-13T00:00:00Z",
      launch_email_sent_at: null,
    })
    expect(dec.email).toBe("only@example.com")
    expect(dec.name).toBeNull()
    expect(dec.ip_address).toBeNull()
    expect(dec.user_agent).toBeNull()
  })

  it("AAD binding: row A ciphertext fails when relabeled as row B", () => {
    const rowA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
    const rowB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
    const enc = encryptWaitlistWrite({ email: "x@y.z" }, rowA)
    expect(() =>
      decryptWaitlistRow({
        id: rowB,
        email_enc: enc.email_enc,
        name_enc: null,
        ip_address_enc: null,
        user_agent_enc: null,
        source: null,
        created_at: "2026-05-13T00:00:00Z",
        launch_email_sent_at: null,
      }),
    ).toThrow()
  })
})

describe("lib/repos/waitlist - create/get", () => {
  it("createWaitlistEntry encrypts: insert payload has *_enc envelopes, no plaintext PII", async () => {
    const out = await createWaitlistEntry(supabase, {
      email: "ada@example.com",
      name: "Ada",
      ip_address: "1.2.3.4",
      user_agent: "UA",
      source: "blog",
    })
    expect(out.email).toBe("ada@example.com")
    const insertCall = db.calls.find((c) => c.op === "insert")!
    const p = insertCall.payload as Record<string, unknown>
    expect(typeof p.email_enc).toBe("string")
    expect((p.email_enc as string).startsWith("v1r.")).toBe(true)
    expect((p.name_enc as string).startsWith("v1r.")).toBe(true)
    expect((p.ip_address_enc as string).startsWith("v1r.")).toBe(true)
    expect((p.user_agent_enc as string).startsWith("v1r.")).toBe(true)
    expect(p.email).toBeUndefined()
    expect(p.name).toBeUndefined()
    expect(p.ip_address).toBeUndefined()
    expect(p.user_agent).toBeUndefined()
    for (const v of Object.values(p)) {
      if (typeof v === "string") {
        expect(v).not.toBe("ada@example.com")
        expect(v).not.toBe("Ada")
        expect(v).not.toBe("1.2.3.4")
      }
    }
  })

  it("getWaitlistEntry decrypts", async () => {
    const created = await createWaitlistEntry(supabase, {
      email: "bob@example.com",
      name: "Bob",
    })
    const fetched = await getWaitlistEntry(supabase, created.id)
    expect(fetched).not.toBeNull()
    expect(fetched!.email).toBe("bob@example.com")
    expect(fetched!.name).toBe("Bob")
  })

  it("getWaitlistEntry returns null for missing row", async () => {
    const missing = await getWaitlistEntry(
      supabase,
      "99999999-9999-4999-8999-999999999999",
    )
    expect(missing).toBeNull()
  })
})

describe("lib/repos/waitlist - admin list + lifecycle", () => {
  it("listWaitlistForAdmin decrypts every row", async () => {
    await createWaitlistEntry(supabase, { email: "a@x.com", name: "A" })
    await createWaitlistEntry(supabase, { email: "b@x.com", name: "B" })
    await createWaitlistEntry(supabase, { email: "c@x.com", name: "C" })
    const list = await listWaitlistForAdmin(supabase)
    expect(list).toHaveLength(3)
    const emails = list.map((r) => r.email).sort()
    expect(emails).toEqual(["a@x.com", "b@x.com", "c@x.com"])
  })

  it("deleteWaitlistEntry removes the row", async () => {
    const e = await createWaitlistEntry(supabase, { email: "d@x.com" })
    await deleteWaitlistEntry(supabase, e.id)
    const missing = await getWaitlistEntry(supabase, e.id)
    expect(missing).toBeNull()
  })

  it("markWaitlistLaunchSent + listUnsentWaitlist", async () => {
    const a = await createWaitlistEntry(supabase, { email: "u1@x.com" })
    const b = await createWaitlistEntry(supabase, { email: "u2@x.com" })
    await markWaitlistLaunchSent(supabase, a.id)
    const unsent = await listUnsentWaitlist(supabase)
    expect(unsent).toHaveLength(1)
    expect(unsent[0]!.id).toBe(b.id)
    expect(unsent[0]!.email).toBe("u2@x.com")
  })
})
