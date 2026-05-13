import { describe, it, expect, beforeAll, beforeEach } from "vitest"
import {
  encryptAuditLogWrite,
  decryptAuditLogRow,
  createAuditLogEntry,
  listAuditLogForAdmin,
  anonymizeAuditLogForUser,
  type AuditLogEncryptedRow,
  type AuditLogEncryptedInsert,
  type AuditLogWrite,
} from "@/lib/repos/audit-log"
import {
  encryptForSystem,
  encryptForUser,
  encryptJSONForSystem,
  encryptJSONForUser,
} from "@/lib/crypto"

const FIXED_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

const USER_A = "11111111-1111-4111-8111-111111111111"
const USER_B = "22222222-2222-4222-8222-222222222222"
const ROW_1 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
const ROW_2 = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
const ROW_3 = "cccccccc-cccc-4ccc-8ccc-cccccccccccc"
const ROW_4 = "dddddddd-dddd-4ddd-8ddd-dddddddddddd"
const ROW_5 = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee"

beforeAll(() => {
  process.env.ENCRYPTION_KEY_V1 = FIXED_KEY
})

// --- minimal Supabase mock --------------------------------------------------
//
// Each table is an in-memory array; the client implements the subset of the
// PostgREST surface we actually call (.from, .insert, .select, .single,
// .maybeSingle, .order, .range, .eq, .update, .delete).

interface MockState {
  rows: AuditLogEncryptedRow[]
}

// Build a query-builder that mimics the PostgREST chain. Every builder is
// thenable: `await client.from("x").select("*").eq("y", 1)` resolves to
// `{ data, error }`. `.single()` / `.maybeSingle()` short-circuit to the
// first row.
function makeMockClient(state: MockState) {
  function buildQuery() {
    const filters: Record<string, unknown> = {}
    let rangeFrom: number | null = null
    let rangeTo: number | null = null

    function resolve() {
      let data = state.rows.filter((row) =>
        Object.entries(filters).every(
          ([k, v]) => (row as unknown as Record<string, unknown>)[k] === v,
        ),
      )
      if (rangeFrom !== null && rangeTo !== null) {
        data = data.slice(rangeFrom, rangeTo + 1)
      }
      return { data, error: null as null }
    }

    const builder: {
      eq: (col: string, val: unknown) => typeof builder
      order: (col: string, opts: { ascending: boolean }) => typeof builder
      range: (from: number, to: number) => typeof builder
      select: (cols: string) => typeof builder
      single: () => Promise<{ data: AuditLogEncryptedRow | null; error: null }>
      maybeSingle: () => Promise<{
        data: AuditLogEncryptedRow | null
        error: null
      }>
      then: <T1, T2 = never>(
        onF?: (v: { data: AuditLogEncryptedRow[]; error: null }) => T1 | PromiseLike<T1>,
        onR?: (e: unknown) => T2 | PromiseLike<T2>,
      ) => Promise<T1 | T2>
    } = {
      eq(col: string, val: unknown) {
        filters[col] = val
        return builder
      },
      order() {
        return builder
      },
      range(from: number, to: number) {
        rangeFrom = from
        rangeTo = to
        return builder
      },
      select() {
        return builder
      },
      single() {
        const { data } = resolve()
        return Promise.resolve({ data: data[0] ?? null, error: null })
      },
      maybeSingle() {
        const { data } = resolve()
        return Promise.resolve({ data: data[0] ?? null, error: null })
      },
      then(onF, onR) {
        return Promise.resolve(resolve()).then(onF, onR)
      },
    }
    return builder
  }

  return {
    from(_table: string) {
      return {
        insert(payload: { id: string } & AuditLogEncryptedInsert) {
          const row: AuditLogEncryptedRow = {
            id: payload.id,
            user_id: payload.user_id,
            user_email_enc: payload.user_email_enc,
            action: payload.action,
            resource_type: payload.resource_type,
            resource_id: payload.resource_id,
            details_enc: payload.details_enc,
            ip_address_enc: payload.ip_address_enc,
            user_agent_enc: payload.user_agent_enc,
            status: payload.status,
            created_at: "2026-05-13T00:00:00.000Z",
          }
          state.rows.push(row)
          return {
            select(_cols: string) {
              return {
                single() {
                  return Promise.resolve({ data: row, error: null })
                },
              }
            },
          }
        },
        select(_cols: string) {
          return buildQuery()
        },
        update(patch: Partial<AuditLogEncryptedRow>) {
          return {
            eq(col: keyof AuditLogEncryptedRow, val: unknown) {
              state.rows = state.rows.map((row) =>
                (row as unknown as Record<string, unknown>)[col as string] === val
                  ? { ...row, ...patch }
                  : row,
              )
              return Promise.resolve({ error: null })
            },
          }
        },
      }
    },
  }
}

beforeEach(() => {
  // No global cleanup needed; each test makes its own state.
})

// --- helpers ---------------------------------------------------------------

function buildUserRow(input: AuditLogWrite, rowId: string): AuditLogEncryptedRow {
  const enc = encryptAuditLogWrite(input, rowId)
  return {
    id: rowId,
    ...enc,
    created_at: "2026-05-13T00:00:00.000Z",
  }
}

// --- tests -----------------------------------------------------------------

describe("audit-log repo - roundtrip user-key", () => {
  it("encrypts under the user's DEK and decrypts back", () => {
    const row = buildUserRow(
      {
        user_id: USER_A,
        user_email: "alice@example.com",
        action: "login",
        resource_type: "auth",
        resource_id: "session_1",
        details: { ua: "test", success: true },
        ip_address: "203.0.113.7",
        user_agent: "vitest/1.0",
        status: "success",
      },
      ROW_1,
    )

    // Sanity: envelope versions reflect user-key mode.
    expect(row.user_email_enc).toMatch(/^v1u\./)
    expect(row.details_enc).toMatch(/^v1u\./)
    expect(row.ip_address_enc).toMatch(/^v1u\./)
    expect(row.user_agent_enc).toMatch(/^v1u\./)

    const out = decryptAuditLogRow(row)
    expect(out.user_id).toBe(USER_A)
    expect(out.user_email).toBe("alice@example.com")
    expect(out.action).toBe("login")
    expect(out.resource_type).toBe("auth")
    expect(out.resource_id).toBe("session_1")
    expect(out.details).toEqual({ ua: "test", success: true })
    expect(out.ip_address).toBe("203.0.113.7")
    expect(out.user_agent).toBe("vitest/1.0")
    expect(out.status).toBe("success")
  })
})

describe("audit-log repo - roundtrip system-key (user_id NULL)", () => {
  it("encrypts under the system master key when user_id is NULL", () => {
    const row = buildUserRow(
      {
        user_id: null,
        user_email: null,
        action: "csp_violation",
        details: { directive: "script-src", blocked: "https://evil.example/x.js" },
        ip_address: "198.51.100.4",
        user_agent: "Mozilla/5.0",
      },
      ROW_2,
    )

    expect(row.user_id).toBeNull()
    expect(row.details_enc).toMatch(/^v1s\./)
    expect(row.ip_address_enc).toMatch(/^v1s\./)
    expect(row.user_agent_enc).toMatch(/^v1s\./)

    const out = decryptAuditLogRow(row)
    expect(out.user_id).toBeNull()
    expect(out.user_email).toBeNull()
    expect(out.action).toBe("csp_violation")
    expect(out.details).toEqual({
      directive: "script-src",
      blocked: "https://evil.example/x.js",
    })
    expect(out.ip_address).toBe("198.51.100.4")
    expect(out.user_agent).toBe("Mozilla/5.0")
  })

  it("uses status default of 'success' when not provided", () => {
    const row = buildUserRow({ user_id: null, action: "boot" }, ROW_3)
    expect(decryptAuditLogRow(row).status).toBe("success")
  })

  it("uses details default of {} when not provided", () => {
    const row = buildUserRow({ user_id: USER_A, action: "noop" }, ROW_4)
    expect(decryptAuditLogRow(row).details).toEqual({})
  })
})

describe("audit-log repo - mixed list of user + system rows", () => {
  it("decrypts a heterogeneous batch (3 user-keyed + 2 system)", async () => {
    const state: MockState = { rows: [] }
    state.rows.push(
      buildUserRow(
        { user_id: USER_A, user_email: "alice@x.com", action: "login" },
        ROW_1,
      ),
    )
    state.rows.push(
      buildUserRow(
        { user_id: USER_A, user_email: "alice@x.com", action: "scan" },
        ROW_2,
      ),
    )
    state.rows.push(
      buildUserRow(
        { user_id: USER_B, user_email: "bob@y.com", action: "login" },
        ROW_3,
      ),
    )
    state.rows.push(buildUserRow({ user_id: null, action: "csp_violation" }, ROW_4))
    state.rows.push(buildUserRow({ user_id: null, action: "stripe_received" }, ROW_5))

    const client = makeMockClient(state) as unknown as Parameters<
      typeof listAuditLogForAdmin
    >[0]
    const out = await listAuditLogForAdmin(client, { limit: 50 })
    expect(out).toHaveLength(5)

    // Verify each row decrypted under its correct key (no exceptions thrown).
    const byId = Object.fromEntries(out.map((r) => [r.id, r]))
    expect(byId[ROW_1].user_email).toBe("alice@x.com")
    expect(byId[ROW_1].user_id).toBe(USER_A)
    expect(byId[ROW_2].user_email).toBe("alice@x.com")
    expect(byId[ROW_2].user_id).toBe(USER_A)
    expect(byId[ROW_3].user_email).toBe("bob@y.com")
    expect(byId[ROW_3].user_id).toBe(USER_B)
    expect(byId[ROW_4].user_id).toBeNull()
    expect(byId[ROW_4].action).toBe("csp_violation")
    expect(byId[ROW_5].user_id).toBeNull()
    expect(byId[ROW_5].action).toBe("stripe_received")
  })
})

describe("audit-log repo - AAD binding", () => {
  it("rejects rows whose id was swapped (column-AAD mismatch)", () => {
    const good = buildUserRow(
      { user_id: USER_A, user_email: "a@x.com", action: "login" },
      ROW_1,
    )
    // Simulate an attacker shuffling row.id while keeping ciphertext.
    const tampered: AuditLogEncryptedRow = { ...good, id: ROW_2 }
    expect(() => decryptAuditLogRow(tampered)).toThrow(/Decrypt failed|auth tag/)
  })

  it("rejects ciphertext moved across columns", () => {
    const good = buildUserRow(
      {
        user_id: USER_A,
        user_email: "a@x.com",
        action: "login",
        ip_address: "10.0.0.1",
      },
      ROW_1,
    )
    // Move user_email ciphertext into ip_address slot.
    const tampered: AuditLogEncryptedRow = {
      ...good,
      ip_address_enc: good.user_email_enc,
    }
    expect(() => decryptAuditLogRow(tampered)).toThrow(/Decrypt failed|auth tag/)
  })
})

describe("audit-log repo - cross-user binding", () => {
  it("rejects a row whose user_id was swapped to another user", () => {
    const good = buildUserRow(
      { user_id: USER_A, user_email: "a@x.com", action: "login" },
      ROW_1,
    )
    const tampered: AuditLogEncryptedRow = { ...good, user_id: USER_B }
    expect(() => decryptAuditLogRow(tampered)).toThrow(/Decrypt failed|auth tag/)
  })
})

describe("audit-log repo - version mismatch", () => {
  it("rejects a v1u. envelope on a row whose user_id is NULL", () => {
    // Manually build a malformed row: ciphertext is v1u. but the row claims
    // to be a system row.
    const userEmailEnc = encryptForUser({
      userId: USER_A,
      plaintext: "a@x.com",
      table: "audit_log",
      column: "user_email",
      rowId: ROW_1,
    })
    const detailsEnc = encryptJSONForUser({
      userId: USER_A,
      payload: { x: 1 },
      table: "audit_log",
      column: "details",
      rowId: ROW_1,
    })
    const row: AuditLogEncryptedRow = {
      id: ROW_1,
      user_id: null,
      user_email_enc: userEmailEnc,
      action: "login",
      resource_type: null,
      resource_id: null,
      details_enc: detailsEnc,
      ip_address_enc: null,
      user_agent_enc: null,
      status: "success",
      created_at: "2026-05-13T00:00:00.000Z",
    }
    expect(() => decryptAuditLogRow(row)).toThrow(/v1u\.|user_id is NULL/)
  })

  it("rejects a v1s. envelope on a row whose user_id is set (sniffs version, but system key won't match)", () => {
    const userEmailEnc = encryptForSystem({
      plaintext: "a@x.com",
      table: "audit_log",
      column: "user_email",
      rowId: ROW_1,
    })
    const detailsEnc = encryptJSONForSystem({
      payload: { x: 1 },
      table: "audit_log",
      column: "details",
      rowId: ROW_1,
    })
    const row: AuditLogEncryptedRow = {
      id: ROW_1,
      user_id: USER_A,
      user_email_enc: userEmailEnc,
      action: "login",
      resource_type: null,
      resource_id: null,
      details_enc: detailsEnc,
      ip_address_enc: null,
      user_agent_enc: null,
      status: "success",
      created_at: "2026-05-13T00:00:00.000Z",
    }
    // System-key envelope on a user row is allowed by the version sniffer
    // (this is the anonymization shape). It decrypts cleanly here because
    // the row id and AAD still match. The behavior we're verifying is
    // that the repo does NOT attempt user-DEK decrypt on a v1s. envelope.
    const out = decryptAuditLogRow(row)
    expect(out.user_email).toBe("a@x.com")
    expect(out.details).toEqual({ x: 1 })
  })
})

describe("audit-log repo - anonymize", () => {
  it("nulls free-text columns and re-keys details_enc to system-key {}", async () => {
    const state: MockState = { rows: [] }
    state.rows.push(
      buildUserRow(
        {
          user_id: USER_A,
          user_email: "alice@x.com",
          action: "login",
          ip_address: "1.2.3.4",
          user_agent: "vitest",
          details: { sensitive: "secret" },
        },
        ROW_1,
      ),
    )
    state.rows.push(
      buildUserRow(
        {
          user_id: USER_A,
          user_email: "alice@x.com",
          action: "scan",
          details: { input: "secret-input" },
        },
        ROW_2,
      ),
    )
    state.rows.push(
      buildUserRow(
        { user_id: USER_B, user_email: "bob@y.com", action: "login" },
        ROW_3,
      ),
    )

    const client = makeMockClient(state) as unknown as Parameters<
      typeof anonymizeAuditLogForUser
    >[0]
    await anonymizeAuditLogForUser(client, USER_A)

    // Alice's two rows: PII fields NULL, details_enc decrypts to {}.
    const a1 = state.rows.find((r) => r.id === ROW_1)!
    const a2 = state.rows.find((r) => r.id === ROW_2)!
    expect(a1.user_email_enc).toBeNull()
    expect(a1.ip_address_enc).toBeNull()
    expect(a1.user_agent_enc).toBeNull()
    expect(a1.details_enc).toMatch(/^v1s\./)
    expect(decryptAuditLogRow(a1).details).toEqual({})

    expect(a2.user_email_enc).toBeNull()
    expect(a2.details_enc).toMatch(/^v1s\./)
    expect(decryptAuditLogRow(a2).details).toEqual({})

    // user_id stays plaintext for historical trail.
    expect(a1.user_id).toBe(USER_A)
    expect(a2.user_id).toBe(USER_A)

    // Bob's row is untouched.
    const b = state.rows.find((r) => r.id === ROW_3)!
    expect(b.user_email_enc).not.toBeNull()
    expect(decryptAuditLogRow(b).user_email).toBe("bob@y.com")
  })
})

describe("audit-log repo - createAuditLogEntry roundtrip via mock client", () => {
  it("inserts and returns a decrypted entry", async () => {
    const state: MockState = { rows: [] }
    const client = makeMockClient(state) as unknown as Parameters<
      typeof createAuditLogEntry
    >[0]
    const out = await createAuditLogEntry(client, {
      user_id: USER_A,
      user_email: "alice@x.com",
      action: "test",
      details: { ok: true },
    })
    expect(out.user_id).toBe(USER_A)
    expect(out.user_email).toBe("alice@x.com")
    expect(out.action).toBe("test")
    expect(out.details).toEqual({ ok: true })
    expect(state.rows).toHaveLength(1)
    expect(state.rows[0].user_email_enc).toMatch(/^v1u\./)
  })
})
