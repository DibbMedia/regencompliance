import { describe, it, expect, beforeAll } from "vitest"
import {
  encryptImpersonationWrite,
  decryptImpersonationRow,
  createImpersonationSession,
  getImpersonationSession,
  deleteImpersonationSession,
  deleteAllSessionsForAdmin,
  type ImpersonationEncryptedRow,
  type ImpersonationEncryptedInsert,
} from "@/lib/repos/impersonation-sessions"

const FIXED_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

const ADMIN_A = "11111111-1111-4111-8111-111111111111"
const ADMIN_B = "22222222-2222-4222-8222-222222222222"
const TARGET_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
const TARGET_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
const ROW_1 = "cccccccc-cccc-4ccc-8ccc-cccccccccccc"
const ROW_2 = "dddddddd-dddd-4ddd-8ddd-dddddddddddd"

beforeAll(() => {
  process.env.ENCRYPTION_KEY_V1 = FIXED_KEY
})

// --- minimal Supabase mock --------------------------------------------------

interface MockState {
  rows: ImpersonationEncryptedRow[]
}

function makeMockClient(state: MockState) {
  function buildQuery() {
    const filters: Record<string, unknown> = {}
    function resolve() {
      const data = state.rows.filter((r) =>
        Object.entries(filters).every(
          ([k, v]) => (r as unknown as Record<string, unknown>)[k] === v,
        ),
      )
      return { data, error: null as null }
    }
    const builder: {
      eq: (col: string, val: unknown) => typeof builder
      select: (cols: string) => typeof builder
      maybeSingle: () => Promise<{
        data: ImpersonationEncryptedRow | null
        error: null
      }>
      single: () => Promise<{
        data: ImpersonationEncryptedRow | null
        error: null
      }>
      then: <T1, T2 = never>(
        onF?: (v: {
          data: ImpersonationEncryptedRow[]
          error: null
        }) => T1 | PromiseLike<T1>,
        onR?: (e: unknown) => T2 | PromiseLike<T2>,
      ) => Promise<T1 | T2>
    } = {
      eq(col: string, val: unknown) {
        filters[col] = val
        return builder
      },
      select() {
        return builder
      },
      maybeSingle() {
        const { data } = resolve()
        return Promise.resolve({ data: data[0] ?? null, error: null })
      },
      single() {
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
        insert(payload: { id: string } & ImpersonationEncryptedInsert) {
          const row: ImpersonationEncryptedRow = {
            id: payload.id,
            admin_user_id: payload.admin_user_id,
            admin_email_enc: payload.admin_email_enc,
            target_user_id: payload.target_user_id,
            target_email_enc: payload.target_email_enc,
            mode: payload.mode,
            expires_at: payload.expires_at,
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
        delete() {
          return {
            eq(col: keyof ImpersonationEncryptedRow, val: unknown) {
              state.rows = state.rows.filter(
                (r) => (r as unknown as Record<string, unknown>)[col as string] !== val,
              )
              return Promise.resolve({ error: null })
            },
          }
        },
      }
    },
  }
}

function buildRow(opts: {
  id: string
  adminUserId: string
  adminEmail: string
  targetUserId: string
  targetEmail: string | null
}): ImpersonationEncryptedRow {
  const enc = encryptImpersonationWrite(
    {
      admin_user_id: opts.adminUserId,
      admin_email: opts.adminEmail,
      target_user_id: opts.targetUserId,
      target_email: opts.targetEmail,
      mode: "read",
      expires_at: "2026-05-13T01:00:00.000Z",
    },
    opts.id,
  )
  return {
    id: opts.id,
    ...enc,
    created_at: "2026-05-13T00:00:00.000Z",
  }
}

// --- tests -----------------------------------------------------------------

describe("impersonation-sessions repo - dual-tenant roundtrip", () => {
  it("encrypts each email under the rightful owner's DEK", () => {
    const row = buildRow({
      id: ROW_1,
      adminUserId: ADMIN_A,
      adminEmail: "admin@dibbmedia.com",
      targetUserId: TARGET_A,
      targetEmail: "user@clinic.example",
    })
    expect(row.admin_email_enc).toMatch(/^v1u\./)
    expect(row.target_email_enc).toMatch(/^v1u\./)
    expect(row.admin_email_enc).not.toBe(row.target_email_enc)

    const out = decryptImpersonationRow(row)
    expect(out.admin_user_id).toBe(ADMIN_A)
    expect(out.admin_email).toBe("admin@dibbmedia.com")
    expect(out.target_user_id).toBe(TARGET_A)
    expect(out.target_email).toBe("user@clinic.example")
    expect(out.mode).toBe("read")
  })
})

describe("impersonation-sessions repo - AAD binding", () => {
  it("rejects ciphertext moved to a different row id (admin column)", () => {
    const row = buildRow({
      id: ROW_1,
      adminUserId: ADMIN_A,
      adminEmail: "admin@dibbmedia.com",
      targetUserId: TARGET_A,
      targetEmail: "u@example.com",
    })
    const tampered: ImpersonationEncryptedRow = { ...row, id: ROW_2 }
    expect(() => decryptImpersonationRow(tampered)).toThrow(/Decrypt failed|auth tag/)
  })

  it("rejects ciphertext swapped between admin and target columns", () => {
    const row = buildRow({
      id: ROW_1,
      adminUserId: ADMIN_A,
      adminEmail: "admin@dibbmedia.com",
      targetUserId: TARGET_A,
      targetEmail: "u@example.com",
    })
    // Swap: put admin_email_enc into target_email_enc and vice versa.
    const tampered: ImpersonationEncryptedRow = {
      ...row,
      admin_email_enc: row.target_email_enc!,
      target_email_enc: row.admin_email_enc,
    }
    expect(() => decryptImpersonationRow(tampered)).toThrow(/Decrypt failed|auth tag/)
  })
})

describe("impersonation-sessions repo - target_email null handling", () => {
  it("stores NULL when target_email is null", () => {
    const row = buildRow({
      id: ROW_1,
      adminUserId: ADMIN_A,
      adminEmail: "admin@dibbmedia.com",
      targetUserId: TARGET_A,
      targetEmail: null,
    })
    expect(row.target_email_enc).toBeNull()
    const out = decryptImpersonationRow(row)
    expect(out.target_email).toBeNull()
    expect(out.admin_email).toBe("admin@dibbmedia.com")
  })
})

describe("impersonation-sessions repo - cross-tenant fails", () => {
  it("swapping admin_user_id breaks admin_email decrypt", () => {
    const row = buildRow({
      id: ROW_1,
      adminUserId: ADMIN_A,
      adminEmail: "admin@dibbmedia.com",
      targetUserId: TARGET_A,
      targetEmail: "u@example.com",
    })
    const tampered: ImpersonationEncryptedRow = { ...row, admin_user_id: ADMIN_B }
    expect(() => decryptImpersonationRow(tampered)).toThrow(/Decrypt failed|auth tag/)
  })

  it("swapping target_user_id breaks target_email decrypt", () => {
    const row = buildRow({
      id: ROW_1,
      adminUserId: ADMIN_A,
      adminEmail: "admin@dibbmedia.com",
      targetUserId: TARGET_A,
      targetEmail: "u@example.com",
    })
    const tampered: ImpersonationEncryptedRow = { ...row, target_user_id: TARGET_B }
    expect(() => decryptImpersonationRow(tampered)).toThrow(/Decrypt failed|auth tag/)
  })
})

describe("impersonation-sessions repo - CRUD via mock client", () => {
  it("createImpersonationSession + getImpersonationSession", async () => {
    const state: MockState = { rows: [] }
    const client = makeMockClient(state) as unknown as Parameters<
      typeof createImpersonationSession
    >[0]

    const created = await createImpersonationSession(client, {
      admin_user_id: ADMIN_A,
      admin_email: "admin@dibbmedia.com",
      target_user_id: TARGET_A,
      target_email: "user@clinic.example",
      mode: "write",
      expires_at: "2026-05-13T01:00:00.000Z",
    })
    expect(created.admin_email).toBe("admin@dibbmedia.com")
    expect(created.target_email).toBe("user@clinic.example")
    expect(created.mode).toBe("write")
    expect(state.rows).toHaveLength(1)
    expect(state.rows[0].admin_email_enc).toMatch(/^v1u\./)

    const fetched = await getImpersonationSession(client, created.id)
    expect(fetched).not.toBeNull()
    expect(fetched!.admin_email).toBe("admin@dibbmedia.com")
    expect(fetched!.target_email).toBe("user@clinic.example")
  })

  it("getImpersonationSession returns null for unknown id", async () => {
    const state: MockState = { rows: [] }
    const client = makeMockClient(state) as unknown as Parameters<
      typeof getImpersonationSession
    >[0]
    const out = await getImpersonationSession(client, ROW_1)
    expect(out).toBeNull()
  })

  it("deleteImpersonationSession removes one row", async () => {
    const state: MockState = { rows: [] }
    state.rows.push(
      buildRow({
        id: ROW_1,
        adminUserId: ADMIN_A,
        adminEmail: "a@x.com",
        targetUserId: TARGET_A,
        targetEmail: "t@y.com",
      }),
    )
    state.rows.push(
      buildRow({
        id: ROW_2,
        adminUserId: ADMIN_A,
        adminEmail: "a@x.com",
        targetUserId: TARGET_B,
        targetEmail: "t2@y.com",
      }),
    )
    const client = makeMockClient(state) as unknown as Parameters<
      typeof deleteImpersonationSession
    >[0]
    await deleteImpersonationSession(client, ROW_1)
    expect(state.rows.map((r) => r.id)).toEqual([ROW_2])
  })

  it("deleteAllSessionsForAdmin removes all rows for that admin", async () => {
    const state: MockState = { rows: [] }
    state.rows.push(
      buildRow({
        id: ROW_1,
        adminUserId: ADMIN_A,
        adminEmail: "a@x.com",
        targetUserId: TARGET_A,
        targetEmail: "t@y.com",
      }),
    )
    state.rows.push(
      buildRow({
        id: ROW_2,
        adminUserId: ADMIN_B,
        adminEmail: "b@x.com",
        targetUserId: TARGET_B,
        targetEmail: "t2@y.com",
      }),
    )
    const client = makeMockClient(state) as unknown as Parameters<
      typeof deleteAllSessionsForAdmin
    >[0]
    await deleteAllSessionsForAdmin(client, ADMIN_A)
    expect(state.rows.map((r) => r.id)).toEqual([ROW_2])
  })
})
