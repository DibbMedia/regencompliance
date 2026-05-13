import { describe, it, expect, beforeAll, beforeEach } from "vitest"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  decryptTicketRow,
  encryptTicketWrite,
  encryptTicketUpdate,
  getTicket,
  listTickets,
  createTicket,
  updateTicketStatus,
  getTicketForAdmin,
  listTicketsForAdmin,
  type TicketEncryptedRow,
} from "@/lib/repos/support-tickets"
import { encryptForUser } from "@/lib/crypto"

const VALID_KEY = "a".repeat(64)

const PROFILE_A = "11111111-1111-4111-8111-111111111111"
const PROFILE_B = "22222222-2222-4222-8222-222222222222"
const TICKET_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
const TICKET_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
const USER_A = "33333333-3333-4333-8333-333333333333"

beforeAll(() => {
  process.env.ENCRYPTION_KEY_V1 = VALID_KEY
})

// --- Mock builder ----------------------------------------------------------

interface MockState {
  // What `.select().eq()...maybeSingle()/single()` resolves to.
  singleData?: unknown
  // What an unfiltered select() (terminal) resolves to.
  listData?: unknown[]
  // What insert/update calls capture.
  inserts: Array<unknown>
  updates: Array<unknown>
  // What insert(...).select().single() returns (echo by default).
  insertReturning?: unknown
  // What update(...).select().single() returns.
  updateReturning?: unknown
}

function makeSupabase(state: MockState): SupabaseClient {
  const builder: Record<string, unknown> = {}
  const single = async () => {
    if (state.singleData !== undefined) return { data: state.singleData, error: null }
    return { data: null, error: null }
  }
  const maybeSingle = single
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
    c.maybeSingle = maybeSingle
    // Make the chain awaitable as a list (used by listTickets terminal await).
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
            data: state.insertReturning ?? buildEchoFromInsert(row),
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
        single: async () => ({
          data: state.updateReturning ?? null,
          error: null,
        }),
      })
      return ec
    }
    return c
  }
  return builder as unknown as SupabaseClient
}

// When we insert with the repo, the insert shape has an id. Build a "row that
// the DB would have returned" by reflecting the insert shape into the encrypted
// row shape (filling defaults for plain cols).
function buildEchoFromInsert(insert: unknown): TicketEncryptedRow {
  const r = insert as Record<string, unknown>
  return {
    id: r.id as string,
    profile_id: r.profile_id as string,
    user_id: (r.user_id as string | null) ?? null,
    subject_enc: r.subject_enc as string,
    status: (r.status as string) ?? "open",
    priority: (r.priority as string) ?? "normal",
    created_at: "2026-05-13T00:00:00.000Z",
    updated_at: "2026-05-13T00:00:00.000Z",
  }
}

function freshState(): MockState {
  return { inserts: [], updates: [] }
}

// --- Tests -----------------------------------------------------------------

describe("lib/repos/support-tickets - pure transforms", () => {
  it("roundtrip via encryptTicketWrite + decryptTicketRow", () => {
    const shape = encryptTicketWrite(
      PROFILE_A,
      {
        profile_id: PROFILE_A,
        user_id: USER_A,
        subject: "Need help with scan",
        status: "open",
        priority: "high",
      },
      TICKET_A,
    )
    expect(shape.subject_enc).toMatch(/^v1u\./)
    const row: TicketEncryptedRow = {
      id: TICKET_A,
      profile_id: PROFILE_A,
      user_id: USER_A,
      subject_enc: shape.subject_enc,
      status: "open",
      priority: "high",
      created_at: "2026-05-13T00:00:00.000Z",
      updated_at: "2026-05-13T00:00:00.000Z",
    }
    const t = decryptTicketRow(PROFILE_A, row)
    expect(t.subject).toBe("Need help with scan")
    expect(t.profile_id).toBe(PROFILE_A)
    expect(t.user_id).toBe(USER_A)
    expect(t.status).toBe("open")
  })

  it("encryptTicketUpdate only re-encrypts changed columns", () => {
    const patch = encryptTicketUpdate(PROFILE_A, TICKET_A, { status: "closed" })
    expect(patch.subject_enc).toBeUndefined()
    expect(patch.status).toBe("closed")
    const patch2 = encryptTicketUpdate(PROFILE_A, TICKET_A, {
      subject: "Updated subject",
    })
    expect(patch2.subject_enc).toMatch(/^v1u\./)
    expect(patch2.status).toBeUndefined()
  })

  it("AAD binding: swapping row id fails to decrypt", () => {
    const env = encryptForUser({
      userId: PROFILE_A,
      plaintext: "secret subject",
      table: "support_tickets",
      column: "subject",
      rowId: TICKET_A,
    })
    const row: TicketEncryptedRow = {
      id: TICKET_B, // wrong id binds wrong AAD
      profile_id: PROFILE_A,
      user_id: null,
      subject_enc: env,
      status: "open",
      priority: "normal",
      created_at: "x",
      updated_at: "x",
    }
    expect(() => decryptTicketRow(PROFILE_A, row)).toThrow(/Decrypt failed/)
  })

  it("cross-profile decryption fails", () => {
    const shape = encryptTicketWrite(
      PROFILE_A,
      { profile_id: PROFILE_A, subject: "secret" },
      TICKET_A,
    )
    const row: TicketEncryptedRow = {
      id: TICKET_A,
      profile_id: PROFILE_A,
      user_id: null,
      subject_enc: shape.subject_enc,
      status: "open",
      priority: "normal",
      created_at: "x",
      updated_at: "x",
    }
    expect(() => decryptTicketRow(PROFILE_B, row)).toThrow(/Decrypt failed/)
  })

  it("NULL subject_enc decrypts to empty string", () => {
    const row: TicketEncryptedRow = {
      id: TICKET_A,
      profile_id: PROFILE_A,
      user_id: null,
      subject_enc: null,
      status: "open",
      priority: "normal",
      created_at: "x",
      updated_at: "x",
    }
    const t = decryptTicketRow(PROFILE_A, row)
    expect(t.subject).toBe("")
  })

  it("encryptTicketWrite throws on profile mismatch", () => {
    expect(() =>
      encryptTicketWrite(
        PROFILE_A,
        { profile_id: PROFILE_B, subject: "x" },
        TICKET_A,
      ),
    ).toThrow(/profileId mismatch/)
  })
})

describe("lib/repos/support-tickets - async API", () => {
  let state: MockState
  beforeEach(() => {
    state = freshState()
  })

  it("getTicket decrypts subject", async () => {
    const env = encryptForUser({
      userId: PROFILE_A,
      plaintext: "billing question",
      table: "support_tickets",
      column: "subject",
      rowId: TICKET_A,
    })
    state.singleData = {
      id: TICKET_A,
      profile_id: PROFILE_A,
      user_id: USER_A,
      subject_enc: env,
      status: "open",
      priority: "normal",
      created_at: "x",
      updated_at: "x",
    }
    const supabase = makeSupabase(state)
    const t = await getTicket(supabase, PROFILE_A, TICKET_A)
    expect(t?.subject).toBe("billing question")
  })

  it("getTicket returns null when row missing", async () => {
    state.singleData = null
    const supabase = makeSupabase(state)
    expect(await getTicket(supabase, PROFILE_A, TICKET_A)).toBeNull()
  })

  it("createTicket encrypts subject; no plaintext appears in insert payload", async () => {
    const supabase = makeSupabase(state)
    const t = await createTicket(supabase, {
      profile_id: PROFILE_A,
      user_id: USER_A,
      subject: "DO NOT LEAK ME",
      status: "open",
      priority: "high",
    })
    expect(t.subject).toBe("DO NOT LEAK ME")
    expect(state.inserts.length).toBe(1)
    const payload = JSON.stringify(state.inserts[0])
    expect(payload).not.toContain("DO NOT LEAK ME")
    expect(payload).toContain("subject_enc")
    expect(payload).not.toContain('"subject"')
  })

  it("updateTicketStatus does not touch subject_enc", async () => {
    const env = encryptForUser({
      userId: PROFILE_A,
      plaintext: "unchanged",
      table: "support_tickets",
      column: "subject",
      rowId: TICKET_A,
    })
    state.updateReturning = {
      id: TICKET_A,
      profile_id: PROFILE_A,
      user_id: null,
      subject_enc: env,
      status: "closed",
      priority: "normal",
      created_at: "x",
      updated_at: "y",
    }
    const supabase = makeSupabase(state)
    const t = await updateTicketStatus(supabase, PROFILE_A, TICKET_A, "closed")
    expect(t.status).toBe("closed")
    expect(t.subject).toBe("unchanged")
    expect(state.updates.length).toBe(1)
    const patch = state.updates[0] as Record<string, unknown>
    expect(patch.subject_enc).toBeUndefined()
    expect(patch.status).toBe("closed")
  })

  it("listTicketsForAdmin returns multiple decrypted rows", async () => {
    const envA = encryptForUser({
      userId: PROFILE_A,
      plaintext: "alpha",
      table: "support_tickets",
      column: "subject",
      rowId: TICKET_A,
    })
    const envB = encryptForUser({
      userId: PROFILE_B,
      plaintext: "beta",
      table: "support_tickets",
      column: "subject",
      rowId: TICKET_B,
    })
    state.listData = [
      {
        id: TICKET_A,
        profile_id: PROFILE_A,
        user_id: null,
        subject_enc: envA,
        status: "open",
        priority: "normal",
        created_at: "x",
        updated_at: "x",
      },
      {
        id: TICKET_B,
        profile_id: PROFILE_B,
        user_id: null,
        subject_enc: envB,
        status: "open",
        priority: "normal",
        created_at: "x",
        updated_at: "x",
      },
    ]
    const supabase = makeSupabase(state)
    const list = await listTicketsForAdmin(supabase, { limit: 50 })
    expect(list.length).toBe(2)
    expect(list[0].subject).toBe("alpha")
    expect(list[1].subject).toBe("beta")
  })

  it("getTicketForAdmin decrypts using row.profile_id", async () => {
    const env = encryptForUser({
      userId: PROFILE_B,
      plaintext: "admin view",
      table: "support_tickets",
      column: "subject",
      rowId: TICKET_B,
    })
    state.singleData = {
      id: TICKET_B,
      profile_id: PROFILE_B,
      user_id: null,
      subject_enc: env,
      status: "open",
      priority: "normal",
      created_at: "x",
      updated_at: "x",
    }
    const supabase = makeSupabase(state)
    const t = await getTicketForAdmin(supabase, TICKET_B)
    expect(t?.subject).toBe("admin view")
  })

  it("listTickets returns decrypted owner rows", async () => {
    const env = encryptForUser({
      userId: PROFILE_A,
      plaintext: "owned",
      table: "support_tickets",
      column: "subject",
      rowId: TICKET_A,
    })
    state.listData = [
      {
        id: TICKET_A,
        profile_id: PROFILE_A,
        user_id: null,
        subject_enc: env,
        status: "open",
        priority: "normal",
        created_at: "x",
        updated_at: "x",
      },
    ]
    const supabase = makeSupabase(state)
    const list = await listTickets(supabase, PROFILE_A, { status: "open", limit: 20 })
    expect(list.length).toBe(1)
    expect(list[0].subject).toBe("owned")
  })
})
