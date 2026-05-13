import { describe, it, expect, beforeAll, beforeEach } from "vitest"
import { randomUUID } from "node:crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  claimByReservationToken,
  createBetaPurchaseReservation,
  decryptBetaPurchaseRow,
  deleteBetaPurchase,
  getBetaPurchase,
  listBetaPurchasesForAdmin,
  type BetaPurchaseEncryptedRow,
} from "@/lib/repos/beta-purchases"
import { encryptForRow } from "@/lib/crypto"
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

const TABLE = "beta_purchases"

function seedBetaPurchase(opts: {
  email: string
  stripe_customer_id?: string
  reservation_token: string
  claimed?: boolean
  claimed_by?: string | null
  reservation_expires_at?: string | null
}) {
  const id = randomUUID()
  const email_enc = encryptForRow({
    rowId: id,
    plaintext: opts.email,
    table: TABLE,
    column: "email",
  })
  const row = {
    id,
    email_enc,
    stripe_customer_id: opts.stripe_customer_id ?? "cus_test",
    stripe_payment_intent_id: null,
    claimed: opts.claimed ?? false,
    claimed_by: opts.claimed_by ?? null,
    reservation_token: opts.reservation_token,
    reserved_at: new Date().toISOString(),
    reservation_expires_at: opts.reservation_expires_at ?? null,
    created_at: new Date().toISOString(),
  }
  db.rows.set(id, row)
  return row
}

describe("lib/repos/beta-purchases - transforms", () => {
  it("decryptBetaPurchaseRow returns email", () => {
    const id = "11111111-1111-4111-8111-111111111111"
    const email_enc = encryptForRow({
      rowId: id,
      plaintext: "buyer@example.com",
      table: TABLE,
      column: "email",
    })
    const encRow: BetaPurchaseEncryptedRow = {
      id,
      email_enc,
      stripe_customer_id: "cus_1",
      stripe_payment_intent_id: "pi_1",
      claimed: false,
      claimed_by: null,
      reservation_token: "tok-1",
      reserved_at: "2026-05-13T00:00:00Z",
      reservation_expires_at: "2026-05-13T00:30:00Z",
      created_at: "2026-05-13T00:00:00Z",
    }
    const dec = decryptBetaPurchaseRow(encRow)
    expect(dec.email).toBe("buyer@example.com")
    expect(dec.stripe_customer_id).toBe("cus_1")
    expect(dec.reservation_token).toBe("tok-1")
  })

  it("AAD binding: row A ciphertext fails for row B", () => {
    const a = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
    const b = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
    const email_enc = encryptForRow({
      rowId: a,
      plaintext: "x@y.com",
      table: TABLE,
      column: "email",
    })
    expect(() =>
      decryptBetaPurchaseRow({
        id: b,
        email_enc,
        stripe_customer_id: "c",
        stripe_payment_intent_id: null,
        claimed: false,
        claimed_by: null,
        reservation_token: "t",
        reserved_at: null,
        reservation_expires_at: null,
        created_at: "2026-05-13T00:00:00Z",
      }),
    ).toThrow()
  })
})

describe("lib/repos/beta-purchases - createBetaPurchaseReservation", () => {
  it("encrypts email; persists stripe_customer_id + reservation_token plaintext", async () => {
    const out = await createBetaPurchaseReservation(supabase, {
      email: "buyer@example.com",
      stripe_customer_id: "cus_abc",
      reservation_token: "tok-xyz",
    })
    expect(out.email).toBe("buyer@example.com")
    expect(out.stripe_customer_id).toBe("cus_abc")
    expect(out.reservation_token).toBe("tok-xyz")
    const insert = db.calls.find((c) => c.op === "insert")!
    const p = insert.payload as Record<string, unknown>
    expect((p.email_enc as string).startsWith("v1r.")).toBe(true)
    expect(p.email).toBeUndefined()
    expect(p.stripe_customer_id).toBe("cus_abc")
    expect(p.reservation_token).toBe("tok-xyz")
    // No payload string equals the plaintext email
    for (const v of Object.values(p)) {
      if (typeof v === "string") {
        expect(v).not.toBe("buyer@example.com")
      }
    }
  })
})

describe("lib/repos/beta-purchases - list + delete", () => {
  it("listBetaPurchasesForAdmin decrypts every row", async () => {
    seedBetaPurchase({ email: "a@e.com", reservation_token: "t1" })
    seedBetaPurchase({ email: "b@e.com", reservation_token: "t2" })
    const list = await listBetaPurchasesForAdmin(supabase)
    expect(list).toHaveLength(2)
    expect(list.map((r) => r.email).sort()).toEqual(["a@e.com", "b@e.com"])
  })

  it("getBetaPurchase decrypts", async () => {
    const r = seedBetaPurchase({ email: "c@e.com", reservation_token: "t3" })
    const f = await getBetaPurchase(supabase, r.id)
    expect(f!.email).toBe("c@e.com")
  })

  it("deleteBetaPurchase removes the row", async () => {
    const r = seedBetaPurchase({ email: "d@e.com", reservation_token: "t4" })
    await deleteBetaPurchase(supabase, r.id)
    expect(await getBetaPurchase(supabase, r.id)).toBeNull()
  })
})

describe("lib/repos/beta-purchases - claimByReservationToken", () => {
  it("happy path: unclaimed row -> claimed:true with decrypted row", async () => {
    const r = seedBetaPurchase({
      email: "h@e.com",
      reservation_token: "tok-happy",
    })
    const userId = "33333333-3333-4333-8333-333333333333"
    const result = await claimByReservationToken(supabase, "tok-happy", userId)
    expect(result.claimed).toBe(true)
    if (result.claimed) {
      expect(result.row.email).toBe("h@e.com")
      expect(result.row.claimed).toBe(true)
      expect(result.row.claimed_by).toBe(userId)
      expect(result.row.id).toBe(r.id)
    }
  })

  it("already-claimed: returns reason=already_claimed", async () => {
    seedBetaPurchase({
      email: "a@e.com",
      reservation_token: "tok-claimed",
      claimed: true,
      claimed_by: "44444444-4444-4444-8444-444444444444",
    })
    const userId = "33333333-3333-4333-8333-333333333333"
    const result = await claimByReservationToken(supabase, "tok-claimed", userId)
    expect(result.claimed).toBe(false)
    if (!result.claimed) {
      expect(result.reason).toBe("already_claimed")
    }
  })

  it("not-found: returns reason=not_found", async () => {
    const userId = "33333333-3333-4333-8333-333333333333"
    const result = await claimByReservationToken(supabase, "tok-missing", userId)
    expect(result.claimed).toBe(false)
    if (!result.claimed) {
      expect(result.reason).toBe("not_found")
    }
  })

  it("NEVER filters by email - all query calls use reservation_token only", async () => {
    seedBetaPurchase({
      email: "audit@e.com",
      reservation_token: "tok-audit",
    })
    const userId = "33333333-3333-4333-8333-333333333333"
    await claimByReservationToken(supabase, "tok-audit", userId)
    // Inspect every filter across every recorded call. None should reference
    // an email-shaped column under any name.
    for (const call of db.calls) {
      for (const f of call.filters) {
        expect(f.col).not.toBe("email")
        expect(f.col).not.toBe("email_enc")
      }
    }
  })

  it("happy path persists claimed=true + claimed_by in DB", async () => {
    const r = seedBetaPurchase({
      email: "persist@e.com",
      reservation_token: "tok-persist",
    })
    const userId = "33333333-3333-4333-8333-333333333333"
    await claimByReservationToken(supabase, "tok-persist", userId)
    const updated = db.rows.get(r.id)!
    expect(updated.claimed).toBe(true)
    expect(updated.claimed_by).toBe(userId)
  })
})
