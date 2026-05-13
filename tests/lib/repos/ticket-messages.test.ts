import { describe, it, expect, beforeAll, beforeEach } from "vitest"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  decryptTicketMessageRow,
  encryptTicketMessageWrite,
  encryptTicketMessageUpdate,
  getTicketMessage,
  listTicketMessages,
  createTicketMessage,
  getTicketMessageForAdmin,
  listTicketMessagesForAdmin,
  type TicketMessageEncryptedRow,
} from "@/lib/repos/ticket-messages"
import { encryptForUser } from "@/lib/crypto"

const VALID_KEY = "a".repeat(64)
const PROFILE_A = "11111111-1111-4111-8111-111111111111"
const PROFILE_B = "22222222-2222-4222-8222-222222222222"
const TICKET_A = "44444444-4444-4444-8444-444444444444"
const MSG_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
const MSG_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
const USER_A = "33333333-3333-4333-8333-333333333333"

beforeAll(() => {
  process.env.ENCRYPTION_KEY_V1 = VALID_KEY
})

interface MockState {
  singleData?: unknown
  listData?: unknown[]
  inserts: Array<unknown>
  updates: Array<unknown>
  insertReturning?: unknown
  updateReturning?: unknown
}

function buildEcho(insert: unknown): TicketMessageEncryptedRow {
  const r = insert as Record<string, unknown>
  return {
    id: r.id as string,
    ticket_id: r.ticket_id as string,
    profile_id: r.profile_id as string,
    user_id: (r.user_id as string | null) ?? null,
    is_admin: (r.is_admin as boolean) ?? false,
    message_enc: r.message_enc as string,
    created_at: "2026-05-13T00:00:00.000Z",
  }
}

function makeSupabase(state: MockState): SupabaseClient {
  const builder: Record<string, unknown> = {}
  const single = async () =>
    state.singleData !== undefined
      ? { data: state.singleData, error: null }
      : { data: null, error: null }
  const thenList = async (resolve: (r: { data: unknown[]; error: null }) => unknown) =>
    resolve({ data: state.listData ?? [], error: null })

  function chain(): Record<string, unknown> {
    const c: Record<string, unknown> = {}
    c.select = () => c
    c.eq = () => c
    c.order = () => c
    c.limit = () => c
    c.range = () => c
    c.single = single
    c.maybeSingle = single
    c.then = thenList
    return c
  }

  builder.from = () => {
    const c = chain()
    c.insert = (row: unknown) => {
      state.inserts.push(row)
      return {
        select: () => ({
          single: async () => ({
            data: state.insertReturning ?? buildEcho(row),
            error: null,
          }),
        }),
      }
    }
    c.update = (patch: unknown) => {
      state.updates.push(patch)
      const ec: Record<string, unknown> = {}
      ec.eq = () => ec
      ec.select = () => ({
        single: async () => ({ data: state.updateReturning ?? null, error: null }),
      })
      return ec
    }
    return c
  }
  return builder as unknown as SupabaseClient
}

function freshState(): MockState {
  return { inserts: [], updates: [] }
}

describe("lib/repos/ticket-messages - pure transforms", () => {
  it("roundtrip", () => {
    const shape = encryptTicketMessageWrite(
      PROFILE_A,
      {
        ticket_id: TICKET_A,
        profile_id: PROFILE_A,
        user_id: USER_A,
        is_admin: false,
        message: "hi there",
      },
      MSG_A,
    )
    expect(shape.message_enc).toMatch(/^v1u\./)
    const row: TicketMessageEncryptedRow = {
      id: MSG_A,
      ticket_id: TICKET_A,
      profile_id: PROFILE_A,
      user_id: USER_A,
      is_admin: false,
      message_enc: shape.message_enc,
      created_at: "x",
    }
    const m = decryptTicketMessageRow(PROFILE_A, row)
    expect(m.message).toBe("hi there")
    expect(m.is_admin).toBe(false)
    expect(m.ticket_id).toBe(TICKET_A)
  })

  it("encryptTicketMessageUpdate skips unchanged fields", () => {
    const patch = encryptTicketMessageUpdate(PROFILE_A, MSG_A, { is_admin: true })
    expect(patch.message_enc).toBeUndefined()
    expect(patch.is_admin).toBe(true)
  })

  it("AAD binding: row id swap fails", () => {
    const env = encryptForUser({
      userId: PROFILE_A,
      plaintext: "secret",
      table: "ticket_messages",
      column: "message",
      rowId: MSG_A,
    })
    const row: TicketMessageEncryptedRow = {
      id: MSG_B,
      ticket_id: TICKET_A,
      profile_id: PROFILE_A,
      user_id: null,
      is_admin: false,
      message_enc: env,
      created_at: "x",
    }
    expect(() => decryptTicketMessageRow(PROFILE_A, row)).toThrow(/Decrypt failed/)
  })

  it("cross-profile decryption fails", () => {
    const shape = encryptTicketMessageWrite(
      PROFILE_A,
      { ticket_id: TICKET_A, profile_id: PROFILE_A, message: "secret" },
      MSG_A,
    )
    const row: TicketMessageEncryptedRow = {
      id: MSG_A,
      ticket_id: TICKET_A,
      profile_id: PROFILE_A,
      user_id: null,
      is_admin: false,
      message_enc: shape.message_enc,
      created_at: "x",
    }
    expect(() => decryptTicketMessageRow(PROFILE_B, row)).toThrow(/Decrypt failed/)
  })

  it("NULL message_enc decrypts to empty string", () => {
    const row: TicketMessageEncryptedRow = {
      id: MSG_A,
      ticket_id: TICKET_A,
      profile_id: PROFILE_A,
      user_id: null,
      is_admin: false,
      message_enc: null,
      created_at: "x",
    }
    expect(decryptTicketMessageRow(PROFILE_A, row).message).toBe("")
  })

  it("encryptTicketMessageWrite throws on profile mismatch", () => {
    expect(() =>
      encryptTicketMessageWrite(
        PROFILE_A,
        { ticket_id: TICKET_A, profile_id: PROFILE_B, message: "x" },
        MSG_A,
      ),
    ).toThrow(/profileId mismatch/)
  })
})

describe("lib/repos/ticket-messages - async API", () => {
  let state: MockState
  beforeEach(() => {
    state = freshState()
  })

  it("getTicketMessage decrypts message", async () => {
    const env = encryptForUser({
      userId: PROFILE_A,
      plaintext: "reply body",
      table: "ticket_messages",
      column: "message",
      rowId: MSG_A,
    })
    state.singleData = {
      id: MSG_A,
      ticket_id: TICKET_A,
      profile_id: PROFILE_A,
      user_id: USER_A,
      is_admin: false,
      message_enc: env,
      created_at: "x",
    }
    const supabase = makeSupabase(state)
    const m = await getTicketMessage(supabase, PROFILE_A, MSG_A)
    expect(m?.message).toBe("reply body")
  })

  it("createTicketMessage encrypts message; no plaintext in payload", async () => {
    const supabase = makeSupabase(state)
    const m = await createTicketMessage(supabase, {
      ticket_id: TICKET_A,
      profile_id: PROFILE_A,
      user_id: USER_A,
      is_admin: true,
      message: "PLAINTEXT TELL",
    })
    expect(m.message).toBe("PLAINTEXT TELL")
    expect(m.is_admin).toBe(true)
    expect(state.inserts.length).toBe(1)
    const payload = JSON.stringify(state.inserts[0])
    expect(payload).not.toContain("PLAINTEXT TELL")
    expect(payload).toContain("message_enc")
    expect(payload).not.toMatch(/"message":/)
  })

  it("listTicketMessages decrypts owner rows", async () => {
    const env = encryptForUser({
      userId: PROFILE_A,
      plaintext: "msg1",
      table: "ticket_messages",
      column: "message",
      rowId: MSG_A,
    })
    state.listData = [
      {
        id: MSG_A,
        ticket_id: TICKET_A,
        profile_id: PROFILE_A,
        user_id: null,
        is_admin: false,
        message_enc: env,
        created_at: "x",
      },
    ]
    const supabase = makeSupabase(state)
    const list = await listTicketMessages(supabase, PROFILE_A, {
      ticket_id: TICKET_A,
      limit: 10,
    })
    expect(list.length).toBe(1)
    expect(list[0].message).toBe("msg1")
  })

  it("listTicketMessagesForAdmin returns multiple decrypted rows across profiles", async () => {
    const envA = encryptForUser({
      userId: PROFILE_A,
      plaintext: "hello A",
      table: "ticket_messages",
      column: "message",
      rowId: MSG_A,
    })
    const envB = encryptForUser({
      userId: PROFILE_B,
      plaintext: "hello B",
      table: "ticket_messages",
      column: "message",
      rowId: MSG_B,
    })
    state.listData = [
      {
        id: MSG_A,
        ticket_id: TICKET_A,
        profile_id: PROFILE_A,
        user_id: null,
        is_admin: false,
        message_enc: envA,
        created_at: "x",
      },
      {
        id: MSG_B,
        ticket_id: TICKET_A,
        profile_id: PROFILE_B,
        user_id: null,
        is_admin: false,
        message_enc: envB,
        created_at: "x",
      },
    ]
    const supabase = makeSupabase(state)
    const list = await listTicketMessagesForAdmin(supabase, { limit: 50 })
    expect(list.length).toBe(2)
    expect(list[0].message).toBe("hello A")
    expect(list[1].message).toBe("hello B")
  })

  it("getTicketMessageForAdmin decrypts using row.profile_id", async () => {
    const env = encryptForUser({
      userId: PROFILE_B,
      plaintext: "from B",
      table: "ticket_messages",
      column: "message",
      rowId: MSG_B,
    })
    state.singleData = {
      id: MSG_B,
      ticket_id: TICKET_A,
      profile_id: PROFILE_B,
      user_id: null,
      is_admin: true,
      message_enc: env,
      created_at: "x",
    }
    const supabase = makeSupabase(state)
    const m = await getTicketMessageForAdmin(supabase, MSG_B)
    expect(m?.message).toBe("from B")
    expect(m?.is_admin).toBe(true)
  })
})
