import { describe, it, expect, beforeAll, beforeEach } from "vitest"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  decryptNotificationRow,
  encryptNotificationWrite,
  encryptNotificationUpdate,
  getNotification,
  listNotifications,
  createNotification,
  createUserNotificationBulk,
  markNotificationRead,
  getNotificationForAdmin,
  listNotificationsForAdmin,
  type NotificationEncryptedRow,
} from "@/lib/repos/notifications"
import { encryptForUser } from "@/lib/crypto"

const VALID_KEY = "a".repeat(64)
const PROFILE_A = "11111111-1111-4111-8111-111111111111"
const PROFILE_B = "22222222-2222-4222-8222-222222222222"
const PROFILE_C = "55555555-5555-4555-8555-555555555555"
const NOTIF_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
const NOTIF_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"

beforeAll(() => {
  process.env.ENCRYPTION_KEY_V1 = VALID_KEY
})

interface MockState {
  singleData?: unknown
  listData?: unknown[]
  inserts: Array<unknown>
  updates: Array<unknown>
  insertReturnings?: unknown[]
  insertCallIdx: number
  updateReturning?: unknown
}

function buildEcho(insert: unknown): NotificationEncryptedRow {
  const r = insert as Record<string, unknown>
  return {
    id: r.id as string,
    profile_id: r.profile_id as string,
    title_enc: r.title_enc as string,
    body_enc: r.body_enc as string,
    action_url_enc: (r.action_url_enc as string | null) ?? null,
    type: (r.type as string) ?? "system",
    read: (r.read as boolean) ?? false,
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
      const idx = state.insertCallIdx
      state.insertCallIdx += 1
      return {
        select: () => ({
          single: async () => ({
            data:
              state.insertReturnings?.[idx] !== undefined
                ? state.insertReturnings[idx]
                : buildEcho(row),
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
  return { inserts: [], updates: [], insertCallIdx: 0 }
}

describe("lib/repos/notifications - pure transforms", () => {
  it("roundtrip with all three encrypted fields", () => {
    const shape = encryptNotificationWrite(
      PROFILE_A,
      {
        title: "New violation found",
        body: "Your page has 3 new violations.",
        type: "scan",
        action_url: "/scans/abc",
      },
      NOTIF_A,
    )
    expect(shape.title_enc).toMatch(/^v1u\./)
    expect(shape.body_enc).toMatch(/^v1u\./)
    expect(shape.action_url_enc).toMatch(/^v1u\./)
    const row: NotificationEncryptedRow = {
      id: NOTIF_A,
      profile_id: PROFILE_A,
      title_enc: shape.title_enc,
      body_enc: shape.body_enc,
      action_url_enc: shape.action_url_enc,
      type: "scan",
      read: false,
      created_at: "x",
    }
    const n = decryptNotificationRow(PROFILE_A, row)
    expect(n.title).toBe("New violation found")
    expect(n.body).toBe("Your page has 3 new violations.")
    expect(n.action_url).toBe("/scans/abc")
    expect(n.type).toBe("scan")
    expect(n.read).toBe(false)
  })

  it("encryptNotificationWrite handles null action_url", () => {
    const shape = encryptNotificationWrite(
      PROFILE_A,
      { title: "T", body: "B", action_url: null },
      NOTIF_A,
    )
    expect(shape.action_url_enc).toBeNull()
  })

  it("encryptNotificationUpdate only re-encrypts changed fields", () => {
    const patch = encryptNotificationUpdate(PROFILE_A, NOTIF_A, { read: true })
    expect(patch.title_enc).toBeUndefined()
    expect(patch.body_enc).toBeUndefined()
    expect(patch.action_url_enc).toBeUndefined()
    expect(patch.read).toBe(true)
    const patch2 = encryptNotificationUpdate(PROFILE_A, NOTIF_A, {
      title: "new title",
    })
    expect(patch2.title_enc).toMatch(/^v1u\./)
    expect(patch2.body_enc).toBeUndefined()
  })

  it("AAD binding: row id swap fails on title", () => {
    const env = encryptForUser({
      userId: PROFILE_A,
      plaintext: "T",
      table: "notifications",
      column: "title",
      rowId: NOTIF_A,
    })
    const row: NotificationEncryptedRow = {
      id: NOTIF_B,
      profile_id: PROFILE_A,
      title_enc: env,
      body_enc: null,
      action_url_enc: null,
      type: "system",
      read: false,
      created_at: "x",
    }
    expect(() => decryptNotificationRow(PROFILE_A, row)).toThrow(/Decrypt failed/)
  })

  it("cross-profile decryption fails", () => {
    const shape = encryptNotificationWrite(
      PROFILE_A,
      { title: "secret", body: "secret body" },
      NOTIF_A,
    )
    const row: NotificationEncryptedRow = {
      id: NOTIF_A,
      profile_id: PROFILE_A,
      title_enc: shape.title_enc,
      body_enc: shape.body_enc,
      action_url_enc: shape.action_url_enc,
      type: "system",
      read: false,
      created_at: "x",
    }
    expect(() => decryptNotificationRow(PROFILE_B, row)).toThrow(/Decrypt failed/)
  })

  it("NULL encrypted columns decrypt to defaults", () => {
    const row: NotificationEncryptedRow = {
      id: NOTIF_A,
      profile_id: PROFILE_A,
      title_enc: null,
      body_enc: null,
      action_url_enc: null,
      type: "system",
      read: false,
      created_at: "x",
    }
    const n = decryptNotificationRow(PROFILE_A, row)
    expect(n.title).toBe("")
    expect(n.body).toBe("")
    expect(n.action_url).toBeNull()
  })
})

describe("lib/repos/notifications - async API", () => {
  let state: MockState
  beforeEach(() => {
    state = freshState()
  })

  it("getNotification decrypts row", async () => {
    const tEnv = encryptForUser({
      userId: PROFILE_A,
      plaintext: "hello",
      table: "notifications",
      column: "title",
      rowId: NOTIF_A,
    })
    const bEnv = encryptForUser({
      userId: PROFILE_A,
      plaintext: "world",
      table: "notifications",
      column: "body",
      rowId: NOTIF_A,
    })
    state.singleData = {
      id: NOTIF_A,
      profile_id: PROFILE_A,
      title_enc: tEnv,
      body_enc: bEnv,
      action_url_enc: null,
      type: "system",
      read: false,
      created_at: "x",
    }
    const supabase = makeSupabase(state)
    const n = await getNotification(supabase, PROFILE_A, NOTIF_A)
    expect(n?.title).toBe("hello")
    expect(n?.body).toBe("world")
    expect(n?.action_url).toBeNull()
  })

  it("createNotification encrypts all fields; no plaintext in payload", async () => {
    const supabase = makeSupabase(state)
    const n = await createNotification(supabase, PROFILE_A, {
      title: "TITLE_SECRET",
      body: "BODY_SECRET",
      type: "billing",
      action_url: "URL_SECRET",
    })
    expect(n.title).toBe("TITLE_SECRET")
    expect(n.body).toBe("BODY_SECRET")
    expect(n.action_url).toBe("URL_SECRET")
    expect(state.inserts.length).toBe(1)
    const payload = JSON.stringify(state.inserts[0])
    expect(payload).not.toContain("TITLE_SECRET")
    expect(payload).not.toContain("BODY_SECRET")
    expect(payload).not.toContain("URL_SECRET")
    expect(payload).toContain("title_enc")
    expect(payload).toContain("body_enc")
    expect(payload).toContain("action_url_enc")
  })

  it("createUserNotificationBulk: 3 profiles -> 3 inserts, each AAD-bound to its own row id", async () => {
    const supabase = makeSupabase(state)
    const out = await createUserNotificationBulk(supabase, [
      { profileId: PROFILE_A, input: { title: "Tα", body: "Bα" } },
      { profileId: PROFILE_B, input: { title: "Tβ", body: "Bβ" } },
      { profileId: PROFILE_C, input: { title: "Tγ", body: "Bγ" } },
    ])
    expect(out.length).toBe(3)
    expect(state.inserts.length).toBe(3)
    const ids = new Set<string>()
    const profiles: string[] = []
    for (const ins of state.inserts) {
      const r = ins as Record<string, unknown>
      ids.add(r.id as string)
      profiles.push(r.profile_id as string)
      // Each AAD is bound to its own row id: re-decrypting with a different id must fail.
      const env = r.title_enc as string
      expect(() =>
        decryptNotificationRow(r.profile_id as string, {
          id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
          profile_id: r.profile_id as string,
          title_enc: env,
          body_enc: null,
          action_url_enc: null,
          type: "system",
          read: false,
          created_at: "x",
        }),
      ).toThrow(/Decrypt failed/)
    }
    expect(ids.size).toBe(3)
    expect(profiles).toEqual([PROFILE_A, PROFILE_B, PROFILE_C])
    expect(out[0].title).toBe("Tα")
    expect(out[1].title).toBe("Tβ")
    expect(out[2].title).toBe("Tγ")
  })

  it("markNotificationRead does not touch encrypted fields", async () => {
    const tEnv = encryptForUser({
      userId: PROFILE_A,
      plaintext: "stable",
      table: "notifications",
      column: "title",
      rowId: NOTIF_A,
    })
    const bEnv = encryptForUser({
      userId: PROFILE_A,
      plaintext: "stable body",
      table: "notifications",
      column: "body",
      rowId: NOTIF_A,
    })
    state.updateReturning = {
      id: NOTIF_A,
      profile_id: PROFILE_A,
      title_enc: tEnv,
      body_enc: bEnv,
      action_url_enc: null,
      type: "system",
      read: true,
      created_at: "x",
    }
    const supabase = makeSupabase(state)
    const n = await markNotificationRead(supabase, PROFILE_A, NOTIF_A, true)
    expect(n.read).toBe(true)
    expect(state.updates.length).toBe(1)
    const patch = state.updates[0] as Record<string, unknown>
    expect(patch.title_enc).toBeUndefined()
    expect(patch.body_enc).toBeUndefined()
    expect(patch.read).toBe(true)
  })

  it("listNotificationsForAdmin returns multiple decrypted rows across profiles", async () => {
    const tA = encryptForUser({
      userId: PROFILE_A,
      plaintext: "alpha title",
      table: "notifications",
      column: "title",
      rowId: NOTIF_A,
    })
    const bA = encryptForUser({
      userId: PROFILE_A,
      plaintext: "alpha body",
      table: "notifications",
      column: "body",
      rowId: NOTIF_A,
    })
    const tB = encryptForUser({
      userId: PROFILE_B,
      plaintext: "beta title",
      table: "notifications",
      column: "title",
      rowId: NOTIF_B,
    })
    const bB = encryptForUser({
      userId: PROFILE_B,
      plaintext: "beta body",
      table: "notifications",
      column: "body",
      rowId: NOTIF_B,
    })
    state.listData = [
      {
        id: NOTIF_A,
        profile_id: PROFILE_A,
        title_enc: tA,
        body_enc: bA,
        action_url_enc: null,
        type: "system",
        read: false,
        created_at: "x",
      },
      {
        id: NOTIF_B,
        profile_id: PROFILE_B,
        title_enc: tB,
        body_enc: bB,
        action_url_enc: null,
        type: "system",
        read: false,
        created_at: "x",
      },
    ]
    const supabase = makeSupabase(state)
    const list = await listNotificationsForAdmin(supabase, { limit: 50 })
    expect(list.length).toBe(2)
    expect(list[0].title).toBe("alpha title")
    expect(list[1].title).toBe("beta title")
  })

  it("listNotifications returns decrypted owner rows", async () => {
    const tEnv = encryptForUser({
      userId: PROFILE_A,
      plaintext: "owner only",
      table: "notifications",
      column: "title",
      rowId: NOTIF_A,
    })
    const bEnv = encryptForUser({
      userId: PROFILE_A,
      plaintext: "body x",
      table: "notifications",
      column: "body",
      rowId: NOTIF_A,
    })
    state.listData = [
      {
        id: NOTIF_A,
        profile_id: PROFILE_A,
        title_enc: tEnv,
        body_enc: bEnv,
        action_url_enc: null,
        type: "system",
        read: false,
        created_at: "x",
      },
    ]
    const supabase = makeSupabase(state)
    const list = await listNotifications(supabase, PROFILE_A, { read: false, limit: 10 })
    expect(list.length).toBe(1)
    expect(list[0].title).toBe("owner only")
  })

  it("getNotificationForAdmin decrypts using row.profile_id", async () => {
    const env = encryptForUser({
      userId: PROFILE_B,
      plaintext: "admin sees",
      table: "notifications",
      column: "title",
      rowId: NOTIF_B,
    })
    const bEnv = encryptForUser({
      userId: PROFILE_B,
      plaintext: "admin body",
      table: "notifications",
      column: "body",
      rowId: NOTIF_B,
    })
    state.singleData = {
      id: NOTIF_B,
      profile_id: PROFILE_B,
      title_enc: env,
      body_enc: bEnv,
      action_url_enc: null,
      type: "system",
      read: false,
      created_at: "x",
    }
    const supabase = makeSupabase(state)
    const n = await getNotificationForAdmin(supabase, NOTIF_B)
    expect(n?.title).toBe("admin sees")
    expect(n?.body).toBe("admin body")
  })
})
