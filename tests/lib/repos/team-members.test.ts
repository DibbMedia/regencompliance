import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  decryptTeamMemberRow,
  encryptTeamMemberWrite,
  getTeamMember,
  listTeamMembers,
  inviteTeamMember,
  acceptInvite,
  type TeamMemberEncryptedRow,
} from "@/lib/repos/team-members"
import { withCryptoRequestScope } from "@/lib/crypto"

const VALID_KEY = "a".repeat(64)
const PROFILE_A = "11111111-1111-4111-8111-111111111111"
const PROFILE_B = "22222222-2222-4222-8222-222222222222"
const MEMBER_1 = "33333333-3333-4333-8333-333333333333"
const MEMBER_2 = "44444444-4444-4444-8444-444444444444"
const USER_1 = "55555555-5555-4555-8555-555555555555"

beforeAll(() => {
  process.env.ENCRYPTION_KEY_V1 = VALID_KEY
})

function baseRow(overrides: Partial<TeamMemberEncryptedRow> = {}): TeamMemberEncryptedRow {
  return {
    id: MEMBER_1,
    profile_id: PROFILE_A,
    user_id: null,
    email_enc: null,
    role: "member",
    invite_token: "tok_abc",
    accepted: false,
    accepted_at: null,
    invited_at: "2026-05-13T00:00:00Z",
    ...overrides,
  }
}

// --- Stateless transforms --------------------------------------------------

describe("team-members repo - transforms", () => {
  it("roundtrips email via encrypt/decrypt under profile DEK + row AAD", () => {
    const write = encryptTeamMemberWrite(PROFILE_A, MEMBER_1, {
      email: "invitee@clinic.com",
    })
    expect(write.email_enc).toMatch(/^v1u\./)

    const row = baseRow({ email_enc: write.email_enc ?? null })
    const plain = decryptTeamMemberRow(PROFILE_A, row)
    expect(plain.email).toBe("invitee@clinic.com")
  })

  it("passes through non-encrypted columns unchanged", () => {
    const write = encryptTeamMemberWrite(PROFILE_A, MEMBER_1, {
      email: "x@y.z",
    })
    const row = baseRow({
      email_enc: write.email_enc ?? null,
      user_id: USER_1,
      role: "owner",
      accepted: true,
      accepted_at: "2026-05-14T00:00:00Z",
      invite_token: "tok_zzz",
    })
    const plain = decryptTeamMemberRow(PROFILE_A, row)
    expect(plain).toMatchObject({
      user_id: USER_1,
      role: "owner",
      accepted: true,
      accepted_at: "2026-05-14T00:00:00Z",
      invite_token: "tok_zzz",
    })
  })

  it("throws when email_enc is NULL (data-integrity error)", () => {
    const row = baseRow({ email_enc: null })
    expect(() => decryptTeamMemberRow(PROFILE_A, row)).toThrow(/NULL email_enc/)
  })

  it("AAD binding: ciphertext from row A fails to decrypt as row B", () => {
    const writeA = encryptTeamMemberWrite(PROFILE_A, MEMBER_1, { email: "a@x.com" })
    // Move the ciphertext to a row whose own id is MEMBER_2 but still owned
    // by PROFILE_A. AAD inside the envelope was built with MEMBER_1; decrypt
    // tries MEMBER_2 -> auth tag fails.
    const moved = baseRow({
      id: MEMBER_2,
      email_enc: writeA.email_enc ?? null,
    })
    expect(() => decryptTeamMemberRow(PROFILE_A, moved)).toThrow()
  })

  it("cross-tenant binding: ciphertext under profile A cannot be decrypted as profile B", () => {
    const writeA = encryptTeamMemberWrite(PROFILE_A, MEMBER_1, { email: "a@x.com" })
    // Lie about profile_id to bypass the early guard.
    const lying = baseRow({
      profile_id: PROFILE_B,
      email_enc: writeA.email_enc ?? null,
    })
    expect(() => decryptTeamMemberRow(PROFILE_B, lying)).toThrow()
  })

  it("encryptTeamMemberWrite only emits keys present in the input", () => {
    const write = encryptTeamMemberWrite(PROFILE_A, MEMBER_1, { role: "owner" })
    expect(Object.keys(write)).toEqual(["role"])
  })
})

// --- Supabase mock ---------------------------------------------------------

interface MockState {
  // Single-row read path (for getTeamMember + acceptInvite fetch).
  row: TeamMemberEncryptedRow | null
  // List read path (for listTeamMembers).
  rows: TeamMemberEncryptedRow[]
  lastInsert: Record<string, unknown> | null
  lastUpdate: Record<string, unknown> | null
  selectCalls: number
}

function makeSupabaseMock(state: MockState): SupabaseClient {
  const fromImpl = (_table: string) => {
    return {
      select: (_cols: string) => {
        state.selectCalls += 1
        const filterChain = {
          // Single-key filter: used by acceptInvite (.eq invite_token) and the
          // listTeamMembers chain (.eq profile_id .order).
          eq: (_col: string, _val: unknown) => ({
            // Two-key path (getTeamMember): .eq().eq().maybeSingle()
            eq: (_col2: string, _val2: unknown) => ({
              maybeSingle: async () => ({ data: state.row, error: null }),
            }),
            // Single-key paths.
            maybeSingle: async () => ({ data: state.row, error: null }),
            order: (_orderCol: string, _opts: { ascending: boolean }) => ({
              then: undefined,
              // listTeamMembers awaits .order() directly; emulate that.
              // Vitest awaits the returned thenable.
            }),
          }),
        }
        // listTeamMembers awaits the result of .order() directly. To make
        // that work, we return a thenable from .order(). Rewire here.
        const filterChainWithOrder = {
          eq: (_col: string, _val: unknown) => ({
            eq: (_col2: string, _val2: unknown) => ({
              maybeSingle: async () => ({ data: state.row, error: null }),
            }),
            maybeSingle: async () => ({ data: state.row, error: null }),
            order: (_orderCol: string, _opts: { ascending: boolean }) => {
              return Promise.resolve({ data: state.rows, error: null })
            },
          }),
        }
        return filterChainWithOrder
      },
      insert: (payload: Record<string, unknown>) => {
        state.lastInsert = payload
        return {
          select: (_cols: string) => ({
            single: async () => {
              // Stamp the insert as the current row so downstream reads work.
              state.row = payload as unknown as TeamMemberEncryptedRow
              return { data: state.row, error: null }
            },
          }),
        }
      },
      update: (patch: Record<string, unknown>) => {
        state.lastUpdate = patch
        return {
          eq: (_col: string, _val: unknown) => ({
            select: (_cols: string) => ({
              single: async () => {
                const merged = { ...(state.row as TeamMemberEncryptedRow), ...patch } as TeamMemberEncryptedRow
                state.row = merged
                return { data: merged, error: null }
              },
            }),
          }),
        }
      },
    }
  }
  return { from: fromImpl } as unknown as SupabaseClient
}

// --- CRUD ------------------------------------------------------------------

describe("team-members repo - getTeamMember", () => {
  let state: MockState
  let supabase: SupabaseClient

  beforeEach(() => {
    const enc = encryptTeamMemberWrite(PROFILE_A, MEMBER_1, { email: "x@y.com" })
    state = {
      row: baseRow({ email_enc: enc.email_enc ?? null }),
      rows: [],
      lastInsert: null,
      lastUpdate: null,
      selectCalls: 0,
    }
    supabase = makeSupabaseMock(state)
  })

  it("decrypts the row when found", async () => {
    const m = await getTeamMember(supabase, PROFILE_A, MEMBER_1)
    expect(m?.email).toBe("x@y.com")
  })

  it("returns null when no row matches", async () => {
    state.row = null
    const m = await getTeamMember(supabase, PROFILE_A, MEMBER_1)
    expect(m).toBeNull()
  })

  it("cache hits: two reads under the same scope both succeed", async () => {
    await withCryptoRequestScope(async () => {
      const a = await getTeamMember(supabase, PROFILE_A, MEMBER_1)
      const b = await getTeamMember(supabase, PROFILE_A, MEMBER_1)
      expect(a?.email).toBe("x@y.com")
      expect(b?.email).toBe("x@y.com")
      expect(state.selectCalls).toBe(2)
    })
  })
})

describe("team-members repo - listTeamMembers", () => {
  it("decrypts every row under the same profile DEK", async () => {
    const enc1 = encryptTeamMemberWrite(PROFILE_A, MEMBER_1, { email: "one@x.com" })
    const enc2 = encryptTeamMemberWrite(PROFILE_A, MEMBER_2, { email: "two@x.com" })
    const state: MockState = {
      row: null,
      rows: [
        baseRow({ id: MEMBER_1, email_enc: enc1.email_enc ?? null }),
        baseRow({ id: MEMBER_2, email_enc: enc2.email_enc ?? null }),
      ],
      lastInsert: null,
      lastUpdate: null,
      selectCalls: 0,
    }
    const supabase = makeSupabaseMock(state)
    const list = await listTeamMembers(supabase, PROFILE_A)
    expect(list.map((m) => m.email)).toEqual(["one@x.com", "two@x.com"])
  })
})

describe("team-members repo - inviteTeamMember", () => {
  let state: MockState
  let supabase: SupabaseClient

  beforeEach(() => {
    state = {
      row: null,
      rows: [],
      lastInsert: null,
      lastUpdate: null,
      selectCalls: 0,
    }
    supabase = makeSupabaseMock(state)
  })

  it("encrypts email on insert (mock sees v1u. envelope, no plaintext)", async () => {
    await inviteTeamMember(supabase, PROFILE_A, "fresh@invite.com", "member")
    expect(state.lastInsert).not.toBeNull()
    const insert = state.lastInsert as Record<string, unknown>
    expect(insert.email_enc).toMatch(/^v1u\./)
    expect(insert).not.toHaveProperty("email")
    expect(JSON.stringify(insert)).not.toContain("fresh@invite.com")
  })

  it("stamps profile_id, role, accepted=false, and a fresh invite_token", async () => {
    await inviteTeamMember(supabase, PROFILE_A, "x@y.z", "owner")
    const insert = state.lastInsert as Record<string, unknown>
    expect(insert.profile_id).toBe(PROFILE_A)
    expect(insert.role).toBe("owner")
    expect(insert.accepted).toBe(false)
    expect(typeof insert.invite_token).toBe("string")
    expect((insert.invite_token as string).length).toBeGreaterThan(16)
    expect(typeof insert.id).toBe("string")
    // The generated id MUST be the AAD-bound row id; verify by decrypting.
    const id = insert.id as string
    const m = decryptTeamMemberRow(PROFILE_A, {
      ...(insert as unknown as TeamMemberEncryptedRow),
      id,
    })
    expect(m.email).toBe("x@y.z")
  })

  it("returns the decrypted, freshly-inserted row", async () => {
    const m = await inviteTeamMember(supabase, PROFILE_A, "x@y.z", "member")
    expect(m.email).toBe("x@y.z")
    expect(m.role).toBe("member")
    expect(m.accepted).toBe(false)
  })
})

describe("team-members repo - acceptInvite", () => {
  let state: MockState
  let supabase: SupabaseClient

  beforeEach(() => {
    const enc = encryptTeamMemberWrite(PROFILE_A, MEMBER_1, { email: "pending@x.com" })
    state = {
      row: baseRow({
        email_enc: enc.email_enc ?? null,
        invite_token: "tok_xyz",
      }),
      rows: [],
      lastInsert: null,
      lastUpdate: null,
      selectCalls: 0,
    }
    supabase = makeSupabaseMock(state)
  })

  it("flips accepted + stamps user_id + returns decrypted row", async () => {
    const m = await acceptInvite(supabase, "tok_xyz", USER_1)
    expect(state.lastUpdate).not.toBeNull()
    const patch = state.lastUpdate as Record<string, unknown>
    expect(patch.accepted).toBe(true)
    expect(patch.user_id).toBe(USER_1)
    expect(typeof patch.accepted_at).toBe("string")
    expect(m.email).toBe("pending@x.com")
    expect(m.accepted).toBe(true)
    expect(m.user_id).toBe(USER_1)
  })

  it("throws when no row matches the invite token", async () => {
    state.row = null
    await expect(acceptInvite(supabase, "no-such-token", USER_1)).rejects.toThrow(
      /invite token not found/,
    )
  })
})

// --- Sanity ---------------------------------------------------------------

describe("team-members repo - sanity", () => {
  it("uses the real crypto module", () => {
    const env = encryptTeamMemberWrite(PROFILE_A, MEMBER_1, { email: "hi@x.com" })
    expect(env.email_enc).toMatch(/^v1u\./)
  })

  it("vi is available", () => {
    expect(typeof vi).toBe("object")
  })
})
