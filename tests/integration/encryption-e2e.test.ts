// End-to-end integration suite for the user-level encryption boundary.
//
// Exercises the real `lib/crypto.ts` and `lib/repos/*` against a single shared
// in-memory mocked Supabase client. Each scenario lives in its own
// `describe` block so failures localize to one piece of the encryption
// contract.
//
// What this file does NOT cover:
//  - Migrations: tested by `tests/lib/migrations.test.ts` + the soak runbook.
//  - Crypto-primitive edge cases: tested by `tests/lib/crypto.test.ts` +
//    `tests/lib/crypto-hardening.test.ts`.
//  - Per-repo CRUD detail: tested by `tests/lib/repos/*.test.ts`.
//
// This file is the *integration* gate: lifecycle, RLS-proxy behavior, AAD
// relocation, key drop, byte-flip tamper, pre-auth row binding, JSON
// roundtrip, system-key path, and the reservation_token claim flow.

import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { randomUUID } from "node:crypto"
import type { SupabaseClient } from "@supabase/supabase-js"

import { E2E_KEY } from "./setup"

import {
  decryptForUser,
  encryptForUser,
} from "@/lib/crypto"

import {
  createScan,
  getScan,
  updateScanRewrite,
  type ScanEncryptedRow,
} from "@/lib/repos/scans"
import {
  getProfile,
  updateProfile,
  type ProfileEncryptedRow,
} from "@/lib/repos/profiles"
import {
  claimByReservationToken,
  createBetaPurchaseReservation,
} from "@/lib/repos/beta-purchases"
import {
  createWaitlistEntry,
  decryptWaitlistRow,
  type WaitlistEncryptedRow,
} from "@/lib/repos/waitlist"
import {
  createAuditLogEntry,
  listAuditLogForAdmin,
} from "@/lib/repos/audit-log"
import type { ScanFlag } from "@/lib/types"

// --- UUIDs --------------------------------------------------------------------

const USER_A = "11111111-1111-4111-8111-111111111111"
const USER_B = "22222222-2222-4222-8222-222222222222"

// --- Versatile mock Supabase --------------------------------------------------
//
// In-memory table store; each table is a Map<rowId, row>. The mock implements
// the slice of @supabase/supabase-js that lib/repos/* actually uses:
//
//   .from(table)
//     .insert(payload)          .select(cols).single()        (with chaining)
//     .update(payload).eq(col,v).select(cols).single() / .maybeSingle()
//     .select(cols).eq().eq().maybeSingle() / .single()
//     .select(cols).order().range()  -> awaited directly
//     .delete().eq()
//   ilike(...) — passthrough (no filtering, sufficient for current tests)
//
// Filters supported: .eq("col", val), .is("col", null), .ilike (passthrough).

interface QueryState {
  table: string
  op: "select" | "insert" | "update" | "delete"
  payload?: unknown
  filters: Array<{ kind: "eq" | "is" | "ilike"; col: string; val: unknown }>
  selectCols?: string
}

export interface E2EDb {
  tables: Map<string, Map<string, Record<string, unknown>>>
  calls: QueryState[]
}

function newDb(): E2EDb {
  return { tables: new Map(), calls: [] }
}

function tableOf(db: E2EDb, name: string): Map<string, Record<string, unknown>> {
  let t = db.tables.get(name)
  if (!t) {
    t = new Map()
    db.tables.set(name, t)
  }
  return t
}

function matchesFilters(row: Record<string, unknown>, q: QueryState): boolean {
  for (const f of q.filters) {
    if (f.kind === "eq") {
      if (row[f.col] !== f.val) return false
    } else if (f.kind === "is") {
      if (f.val === null) {
        const v = row[f.col]
        if (v !== null && v !== undefined) return false
      }
    }
    // ilike: passthrough (no filtering).
  }
  return true
}

function makeE2ESupabase(db: E2EDb): SupabaseClient {
  function chain(table: string, op: QueryState["op"], payload?: unknown) {
    const q: QueryState = { table, op, payload, filters: [] }
    db.calls.push(q)

    const tbl = tableOf(db, table)

    function resolveData(): unknown {
      if (op === "insert") {
        const r = { ...(payload as Record<string, unknown>) }
        if (!r.id) r.id = randomUUID()
        if (!r.created_at) r.created_at = new Date().toISOString()
        if (!r.updated_at) r.updated_at = new Date().toISOString()
        // Repo-specific server-side defaults.
        if (table === "beta_purchases") {
          if (r.claimed === undefined) r.claimed = false
          if (r.claimed_by === undefined) r.claimed_by = null
          if (r.stripe_payment_intent_id === undefined) r.stripe_payment_intent_id = null
          if (r.reserved_at === undefined) r.reserved_at = null
          if (r.reservation_expires_at === undefined) r.reservation_expires_at = null
        }
        if (table === "waitlist") {
          if (r.launch_email_sent_at === undefined) r.launch_email_sent_at = null
          if (r.source === undefined) r.source = null
        }
        if (table === "audit_log") {
          if (r.status === undefined) r.status = "success"
        }
        tbl.set(r.id as string, r)
        return r
      }
      if (op === "update") {
        const updates = payload as Record<string, unknown>
        const matched = Array.from(tbl.values()).filter((row) => matchesFilters(row, q))
        const out: Record<string, unknown>[] = []
        for (const row of matched) {
          const merged = { ...row, ...updates }
          tbl.set(row.id as string, merged)
          out.push(merged)
        }
        return out
      }
      if (op === "select") {
        return Array.from(tbl.values()).filter((row) => matchesFilters(row, q))
      }
      if (op === "delete") {
        const matched = Array.from(tbl.values()).filter((row) => matchesFilters(row, q))
        for (const row of matched) tbl.delete(row.id as string)
        return matched
      }
      return null
    }

    const builder = {
      select(cols?: string) {
        q.selectCols = cols
        return builder
      },
      eq(col: string, val: unknown) {
        q.filters.push({ kind: "eq", col, val })
        return builder
      },
      is(col: string, val: unknown) {
        q.filters.push({ kind: "is", col, val })
        return builder
      },
      ilike(col: string, val: unknown) {
        q.filters.push({ kind: "ilike", col, val })
        return builder
      },
      order(_col?: string, _opts?: unknown) {
        return builder
      },
      range(_from?: number, _to?: number) {
        return builder
      },
      async single() {
        const data = resolveData()
        if (Array.isArray(data)) {
          if (data.length === 0) return { data: null, error: { message: "no rows" } }
          return { data: data[0], error: null }
        }
        return { data, error: null }
      },
      async maybeSingle() {
        const data = resolveData()
        if (Array.isArray(data)) {
          return { data: data[0] ?? null, error: null }
        }
        return { data: data ?? null, error: null }
      },
      then<T1>(
        onF: (v: { data: unknown; error: null; count: number | null }) => T1,
        onR?: (e: unknown) => unknown,
      ): Promise<T1> {
        try {
          const data = resolveData()
          const arr = Array.isArray(data) ? data : data == null ? [] : [data]
          return Promise.resolve(
            onF({ data: arr, error: null, count: arr.length }),
          )
        } catch (e) {
          if (onR) return Promise.resolve(onR(e) as T1)
          return Promise.reject(e)
        }
      },
    }
    return builder
  }

  return {
    from(table: string) {
      return {
        select(cols?: string, _opts?: unknown) {
          const b = chain(table, "select")
          if (cols !== undefined) b.select(cols)
          return b
        },
        insert(payload: unknown) {
          return chain(table, "insert", payload)
        },
        update(payload: unknown) {
          return chain(table, "update", payload)
        },
        delete() {
          return chain(table, "delete")
        },
      }
    },
  } as unknown as SupabaseClient
}

// --- Setup --------------------------------------------------------------------

let db: E2EDb
let supabase: SupabaseClient

beforeAll(() => {
  // setup.ts sets ENCRYPTION_KEY_V1, but be defensive.
  process.env.ENCRYPTION_KEY_V1 = E2E_KEY
})

beforeEach(() => {
  db = newDb()
  supabase = makeE2ESupabase(db)
})

afterEach(() => {
  // Restore the key in case a test (key-drop) cleared it.
  process.env.ENCRYPTION_KEY_V1 = E2E_KEY
})

// Helper: seed a profile row directly so the user "exists" in the mock DB
// before updateProfile/getProfile is called. updateProfile uses UPDATE which
// requires an existing row.
function seedEmptyProfile(userId: string): ProfileEncryptedRow {
  const row: ProfileEncryptedRow = {
    id: userId,
    clinic_name_enc: null,
    treatments_enc: null,
    logo_url: null,
    subscription_status: "inactive",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    is_beta_subscriber: false,
    beta_enrolled_at: null,
    cancelled_at: null,
    onboarding_complete: false,
    theme_preference: "system",
    badge_id: null,
    created_at: "2026-05-13T00:00:00Z",
    updated_at: "2026-05-13T00:00:00Z",
  }
  tableOf(db, "profiles").set(userId, row as unknown as Record<string, unknown>)
  return row
}

// --- 1. Happy path: full user lifecycle --------------------------------------

describe("E2E: full user lifecycle (profile + scan)", () => {
  it("create profile -> create scan -> read back -> rewrite", async () => {
    seedEmptyProfile(USER_A)

    // 1. updateProfile (encrypts clinic_name + treatments)
    const profile = await updateProfile(supabase, USER_A, {
      clinic_name: "Sunrise Stem Cell",
      treatments: ["PRP", "Stem Cells", "Exosomes"],
    })
    expect(profile.clinic_name).toBe("Sunrise Stem Cell")
    expect(profile.treatments).toEqual(["PRP", "Stem Cells", "Exosomes"])

    // Verify what hit the wire: clinic_name_enc + treatments_enc, no plaintext.
    const updateCall = db.calls.find(
      (c) => c.table === "profiles" && c.op === "update",
    )
    expect(updateCall).toBeTruthy()
    const updatePayload = updateCall!.payload as Record<string, unknown>
    expect(updatePayload).not.toHaveProperty("clinic_name")
    expect(updatePayload).not.toHaveProperty("treatments")
    expect(updatePayload.clinic_name_enc).toMatch(/^v1u\./)
    expect(updatePayload.treatments_enc).toMatch(/^v1u\./)

    // 2. getProfile decrypts back to plaintext
    const reread = await getProfile(supabase, USER_A)
    expect(reread).not.toBeNull()
    expect(reread!.clinic_name).toBe("Sunrise Stem Cell")
    expect(reread!.treatments).toEqual(["PRP", "Stem Cells", "Exosomes"])

    // 3. createScan with all 4 encrypted fields
    const flags: ScanFlag[] = [
      {
        rule_id: "rule-cure",
        matched_text: "cure",
        banned_phrase: "cure",
        risk_level: "high",
        reason: "Outcome claim",
        alternative: "may help",
      },
    ]
    const scanId = randomUUID()
    const scan = await createScan(supabase, {
      id: scanId,
      profile_id: USER_A,
      content_type: "website",
      original_text: "Our therapy will cure your arthritis.",
      flags,
      source_url: "https://sunrise.example/treatments",
      compliance_score: 35,
      flag_count: 1,
      high_risk_count: 1,
      medium_risk_count: 0,
      low_risk_count: 0,
    })

    expect(scan.id).toBe(scanId)
    expect(scan.original_text).toBe("Our therapy will cure your arthritis.")
    expect(scan.flags).toEqual(flags)
    expect(scan.source_url).toBe("https://sunrise.example/treatments")

    // Insert payload must be ciphertext-only on the encrypted columns.
    const insertCall = db.calls.find(
      (c) => c.table === "scans" && c.op === "insert",
    )
    expect(insertCall).toBeTruthy()
    const insertPayload = insertCall!.payload as Record<string, unknown>
    expect(insertPayload.original_text_enc).toMatch(/^v1u\./)
    expect(insertPayload.rewritten_text_enc).toBeNull() // not provided
    expect(insertPayload.flags_enc).toMatch(/^v1u\./)
    expect(insertPayload.source_url_enc).toMatch(/^v1u\./)
    expect(insertPayload).not.toHaveProperty("original_text")
    expect(insertPayload).not.toHaveProperty("rewritten_text")
    expect(insertPayload).not.toHaveProperty("flags")
    expect(insertPayload).not.toHaveProperty("source_url")

    // 4. getScan roundtrips
    const fetched = await getScan(supabase, USER_A, scanId)
    expect(fetched).not.toBeNull()
    expect(fetched!.original_text).toBe("Our therapy will cure your arthritis.")
    expect(fetched!.flags).toEqual(flags)

    // 5. updateScanRewrite updates rewritten_text_enc only
    const rewritten = await updateScanRewrite(
      supabase,
      USER_A,
      scanId,
      "Our therapy may help with arthritis symptoms.",
    )
    expect(rewritten.rewritten_text).toBe(
      "Our therapy may help with arthritis symptoms.",
    )
    // Original_text / flags / source_url survive.
    expect(rewritten.original_text).toBe("Our therapy will cure your arthritis.")
    expect(rewritten.flags).toEqual(flags)
    expect(rewritten.source_url).toBe("https://sunrise.example/treatments")

    // The update payload touches rewritten_text_enc and nothing else.
    const updateScanCall = db.calls.find(
      (c) => c.table === "scans" && c.op === "update",
    )
    expect(updateScanCall).toBeTruthy()
    const updateScanPayload = updateScanCall!.payload as Record<string, unknown>
    expect(Object.keys(updateScanPayload)).toEqual(["rewritten_text_enc"])
    expect(updateScanPayload.rewritten_text_enc).toMatch(/^v1u\./)
  })
})

// --- 2. Cross-user RLS proxy: encryption is defense-in-depth -----------------

describe("E2E: encryption is defense-in-depth beyond RLS", () => {
  it("user B reading user A's scan returns null when RLS denies (mock)", async () => {
    seedEmptyProfile(USER_A)
    const scanId = randomUUID()
    await createScan(supabase, {
      id: scanId,
      profile_id: USER_A,
      content_type: "website",
      original_text: "Private treatment notes for user A.",
      flags: [],
    })

    // User B's getScan filters by `.eq("profile_id", USER_B)` — that filter
    // misses the row, so the mock returns null. This models RLS denying the
    // cross-tenant read at the DB layer.
    const result = await getScan(supabase, USER_B, scanId)
    expect(result).toBeNull()
  })

  it("if RLS WERE bypassed (mock returns A's row), B's DEK fails to decrypt", async () => {
    // Pull the encrypted row directly out of the mock store after creation,
    // then attempt to decryptForUser as user B (AAD/DEK mismatch).
    seedEmptyProfile(USER_A)
    const scanId = randomUUID()
    await createScan(supabase, {
      id: scanId,
      profile_id: USER_A,
      content_type: "website",
      original_text: "Top secret patient text",
      flags: [],
    })
    const stored = tableOf(db, "scans").get(scanId) as unknown as ScanEncryptedRow

    // Simulating a DB-only compromise: attacker exfiltrated the ciphertext.
    // Without USER_A's DEK they cannot decrypt — even using a valid USER_B
    // session.
    expect(() =>
      decryptForUser({
        userId: USER_B,
        envelope: stored.original_text_enc!,
        table: "scans",
        column: "original_text",
        rowId: scanId,
      }),
    ).toThrow(/Decrypt failed/)
  })
})

// --- 3. Key drop: prod refusal -----------------------------------------------

describe("E2E: key drop refuses to read or write", () => {
  it("clearing ENCRYPTION_KEY_V1 throws on getProfile, restoring it heals", async () => {
    seedEmptyProfile(USER_A)
    await updateProfile(supabase, USER_A, {
      clinic_name: "Some Clinic",
      treatments: ["PRP"],
    })

    // Drop the key.
    process.env.ENCRYPTION_KEY_V1 = ""
    await expect(getProfile(supabase, USER_A)).rejects.toThrow(
      /Missing ENCRYPTION_KEY_V1/,
    )

    // Restore — reads work again.
    process.env.ENCRYPTION_KEY_V1 = E2E_KEY
    const restored = await getProfile(supabase, USER_A)
    expect(restored!.clinic_name).toBe("Some Clinic")
  })
})

// --- 4. Tamper: byte flip in the encrypted column ----------------------------

describe("E2E: byte-flip tamper breaks decrypt", () => {
  it("flipping a character in the envelope body throws on decrypt", async () => {
    seedEmptyProfile(USER_A)
    await updateProfile(supabase, USER_A, {
      clinic_name: "Sunrise",
      treatments: ["PRP"],
    })

    const stored = tableOf(db, "profiles").get(USER_A) as unknown as ProfileEncryptedRow
    expect(stored.clinic_name_enc).toBeTruthy()

    // Flip one char in the base64url body (post version prefix).
    const env = stored.clinic_name_enc!
    const dot = env.indexOf(".")
    const head = env.slice(0, dot + 1)
    const body = env.slice(dot + 1)
    const flipChar = body[10] === "A" ? "B" : "A"
    const tampered = head + body.slice(0, 10) + flipChar + body.slice(11)

    expect(() =>
      decryptForUser({
        userId: USER_A,
        envelope: tampered,
        table: "profiles",
        column: "clinic_name",
        rowId: USER_A,
      }),
    ).toThrow(/Decrypt failed/)
  })
})

// --- 5. AAD attack: ciphertext relocation ------------------------------------

describe("E2E: AAD prevents column / row relocation", () => {
  it("ciphertext written for column A cannot be read as column B", () => {
    const env = encryptForUser({
      userId: USER_A,
      plaintext: "Sunrise Stem Cell",
      table: "profiles",
      column: "clinic_name",
      rowId: USER_A,
    })
    // Move the envelope to a different column's AAD.
    expect(() =>
      decryptForUser({
        userId: USER_A,
        envelope: env,
        table: "profiles",
        column: "treatments",
        rowId: USER_A,
      }),
    ).toThrow(/Decrypt failed/)
  })

  it("ciphertext written for row A cannot be read with row B id", () => {
    const scanIdA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
    const scanIdB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
    const env = encryptForUser({
      userId: USER_A,
      plaintext: "scan A text",
      table: "scans",
      column: "original_text",
      rowId: scanIdA,
    })
    expect(() =>
      decryptForUser({
        userId: USER_A,
        envelope: env,
        table: "scans",
        column: "original_text",
        rowId: scanIdB,
      }),
    ).toThrow(/Decrypt failed/)
  })

  it("ciphertext written for table A cannot be read as table B", () => {
    const env = encryptForUser({
      userId: USER_A,
      plaintext: "x@y.com",
      table: "team_members",
      column: "email",
      rowId: USER_A,
    })
    expect(() =>
      decryptForUser({
        userId: USER_A,
        envelope: env,
        table: "audit_log",
        column: "email",
        rowId: USER_A,
      }),
    ).toThrow(/Decrypt failed/)
  })
})

// --- 6. Pre-auth -> per-row binding ------------------------------------------

describe("E2E: pre-auth waitlist binds to row id", () => {
  it("createWaitlistEntry roundtrips; wrong rowId fails", async () => {
    const entry = await createWaitlistEntry(supabase, {
      email: "lead@example.com",
      name: "Lead Person",
      ip_address: "203.0.113.7",
      user_agent: "Mozilla/5.0",
      source: "homepage",
    })
    expect(entry.email).toBe("lead@example.com")
    expect(entry.name).toBe("Lead Person")

    // Decrypt with a different rowId should fail.
    const stored = tableOf(db, "waitlist").get(entry.id) as unknown as WaitlistEncryptedRow
    expect(stored.email_enc).toBeTruthy()

    const tampered: WaitlistEncryptedRow = { ...stored, id: randomUUID() }
    expect(() => decryptWaitlistRow(tampered)).toThrow(/Decrypt failed/)
  })

  it("write payload contains no plaintext PII columns", async () => {
    await createWaitlistEntry(supabase, {
      email: "leak-check@example.com",
      name: "Leak Check",
      ip_address: "10.0.0.1",
      user_agent: "vitest",
    })

    const insertCall = db.calls.find(
      (c) => c.table === "waitlist" && c.op === "insert",
    )
    expect(insertCall).toBeTruthy()
    const payload = insertCall!.payload as Record<string, unknown>
    expect(payload).not.toHaveProperty("email")
    expect(payload).not.toHaveProperty("name")
    expect(payload).not.toHaveProperty("ip_address")
    expect(payload).not.toHaveProperty("user_agent")
    expect(payload.email_enc).toMatch(/^v1r\./)
    expect(payload.name_enc).toMatch(/^v1r\./)
    expect(payload.ip_address_enc).toMatch(/^v1r\./)
    expect(payload.user_agent_enc).toMatch(/^v1r\./)
  })
})

// --- 7. JSON column roundtrip ------------------------------------------------

describe("E2E: complex JSON flags survive roundtrip", () => {
  it("5-entry flags array decrypts with structure intact", async () => {
    seedEmptyProfile(USER_A)
    const flags: ScanFlag[] = [
      {
        rule_id: "r-1",
        matched_text: "FDA approved",
        banned_phrase: "FDA approved",
        risk_level: "high",
        reason: "Not approved",
        alternative: "FDA cleared",
        element_type: "h1",
      },
      {
        rule_id: "r-2",
        matched_text: "cure",
        banned_phrase: "cure",
        risk_level: "high",
        reason: "Outcome claim",
        alternative: "may help",
        context: "Our therapy will cure your knees.",
      },
      {
        rule_id: "r-3",
        matched_text: "guaranteed",
        banned_phrase: "guaranteed",
        risk_level: "medium",
        reason: "Outcome guarantee",
        alternative: "intended to support",
      },
      {
        rule_id: "r-4",
        matched_text: "100% safe",
        banned_phrase: "100% safe",
        risk_level: "medium",
        reason: "Safety claim",
        alternative: "generally well tolerated",
      },
      {
        rule_id: "r-5",
        matched_text: "no side effects",
        banned_phrase: "no side effects",
        risk_level: "low",
        reason: "Side-effect claim",
        alternative: "side effects are uncommon",
      },
    ]
    const scanId = randomUUID()
    await createScan(supabase, {
      id: scanId,
      profile_id: USER_A,
      content_type: "website",
      original_text: "Marketing copy",
      flags,
    })

    const out = await getScan(supabase, USER_A, scanId)
    expect(out).not.toBeNull()
    expect(out!.flags).toHaveLength(5)
    for (let i = 0; i < flags.length; i++) {
      expect(out!.flags[i].rule_id).toBe(flags[i].rule_id)
      expect(out!.flags[i].banned_phrase).toBe(flags[i].banned_phrase)
      expect(out!.flags[i].risk_level).toBe(flags[i].risk_level)
      expect(out!.flags[i].reason).toBe(flags[i].reason)
      expect(out!.flags[i].alternative).toBe(flags[i].alternative)
    }
    expect(out!.flags[0].element_type).toBe("h1")
    expect(out!.flags[1].context).toContain("cure your knees")
  })
})

// --- 8. System-key path for null-tenant rows ---------------------------------

describe("E2E: audit_log system-key path for null user_id", () => {
  it("CSP-violation-style row encrypts under v1s. and decrypts back", async () => {
    const entry = await createAuditLogEntry(supabase, {
      user_id: null,
      action: "csp.violation",
      resource_type: "csp",
      details: {
        blocked_uri: "https://evil.example/x.js",
        violated_directive: "script-src",
      },
      ip_address: "198.51.100.42",
      user_agent: "Mozilla/5.0",
    })
    expect(entry.action).toBe("csp.violation")
    expect((entry.details as Record<string, unknown>).blocked_uri).toBe(
      "https://evil.example/x.js",
    )

    // Inspect the stored envelope: should be v1s.
    const stored = tableOf(db, "audit_log").get(entry.id)!
    expect(stored.details_enc as string).toMatch(/^v1s\./)
    expect(stored.ip_address_enc as string).toMatch(/^v1s\./)
    expect(stored.user_agent_enc as string).toMatch(/^v1s\./)

    // listAuditLogForAdmin decrypts cleanly via the system-key branch.
    const list = await listAuditLogForAdmin(supabase, {})
    expect(list).toHaveLength(1)
    expect(list[0].action).toBe("csp.violation")
    expect(
      (list[0].details as Record<string, unknown>).violated_directive,
    ).toBe("script-src")
  })

  it("user-keyed audit row encrypts under v1u.", async () => {
    const entry = await createAuditLogEntry(supabase, {
      user_id: USER_A,
      user_email: "alice@example.com",
      action: "auth.login.success",
      ip_address: "203.0.113.7",
      user_agent: "Chrome",
    })
    const stored = tableOf(db, "audit_log").get(entry.id)!
    expect(stored.details_enc as string).toMatch(/^v1u\./)
    expect(stored.user_email_enc as string).toMatch(/^v1u\./)
    expect(stored.ip_address_enc as string).toMatch(/^v1u\./)
  })
})

// --- 9. Reservation_token claim flow (§12.2) ---------------------------------

describe("E2E: claimByReservationToken does NOT use email-based filters", () => {
  it("claim once -> ok; claim again -> already_claimed; wrong token -> not_found", async () => {
    const token = "tok-" + randomUUID()
    await createBetaPurchaseReservation(supabase, {
      email: "founder@example.com",
      stripe_customer_id: "cus_test_1",
      reservation_token: token,
    })

    // 1. First claim succeeds.
    const r1 = await claimByReservationToken(supabase, token, USER_A)
    expect(r1.claimed).toBe(true)
    if (r1.claimed) {
      expect(r1.row.email).toBe("founder@example.com")
      expect(r1.row.claimed_by).toBe(USER_A)
    }

    // 2. Second claim is rejected.
    const r2 = await claimByReservationToken(supabase, token, USER_B)
    expect(r2.claimed).toBe(false)
    if (!r2.claimed) {
      expect(r2.reason).toBe("already_claimed")
    }

    // 3. Wrong token is not_found.
    const r3 = await claimByReservationToken(supabase, "tok-bogus", USER_A)
    expect(r3.claimed).toBe(false)
    if (!r3.claimed) {
      expect(r3.reason).toBe("not_found")
    }

    // 4. Across ALL beta_purchases calls in this test, no filter ever
    //    referenced `email` or `email_enc`. Verify by scanning calls.
    const bpCalls = db.calls.filter((c) => c.table === "beta_purchases")
    expect(bpCalls.length).toBeGreaterThan(0)
    for (const c of bpCalls) {
      for (const f of c.filters) {
        expect(f.col).not.toBe("email")
        expect(f.col).not.toBe("email_enc")
      }
    }
  })
})
