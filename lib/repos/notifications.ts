// Notifications repository — encrypt-on-write, decrypt-on-read.
// Tenant key = profile_id. AAD = "notifications:{column}:{row.id}".
//
// Per plan §12.4, all rows have profile_id (fan-out pattern; no broadcast NULL
// rows). Per-user encryption only — no v1s. system-key path here.
//
// Encrypted columns: title -> title_enc, body -> body_enc, action_url -> action_url_enc.
// Plain columns: id, profile_id, type, read, created_at.
import { randomUUID } from "node:crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  encryptForUser,
  decryptForUser,
  withCryptoRequestScope,
} from "@/lib/crypto"

const TABLE = "notifications"

export interface Notification {
  id: string
  profile_id: string
  title: string
  body: string
  type: string
  action_url: string | null
  read: boolean
  created_at: string
}

export interface NotificationWrite {
  title: string
  body: string
  type?: string
  action_url?: string | null
}

export interface NotificationEncryptedRow {
  id: string
  profile_id: string
  title_enc: string | null
  body_enc: string | null
  action_url_enc: string | null
  type: string
  read: boolean
  created_at: string
}

export interface NotificationInsertShape {
  id: string
  profile_id: string
  title_enc: string
  body_enc: string
  action_url_enc: string | null
  type?: string
  read?: boolean
}

export interface NotificationUpdateShape {
  title_enc?: string
  body_enc?: string
  action_url_enc?: string | null
  type?: string
  read?: boolean
}

// --- Pure transforms -------------------------------------------------------

export function decryptNotificationRow(
  profileId: string,
  row: NotificationEncryptedRow,
): Notification {
  const title =
    row.title_enc === null || row.title_enc === undefined
      ? ""
      : decryptForUser({
          userId: profileId,
          envelope: row.title_enc,
          table: TABLE,
          column: "title",
          rowId: row.id,
        })
  const body =
    row.body_enc === null || row.body_enc === undefined
      ? ""
      : decryptForUser({
          userId: profileId,
          envelope: row.body_enc,
          table: TABLE,
          column: "body",
          rowId: row.id,
        })
  const action_url =
    row.action_url_enc === null || row.action_url_enc === undefined
      ? null
      : decryptForUser({
          userId: profileId,
          envelope: row.action_url_enc,
          table: TABLE,
          column: "action_url",
          rowId: row.id,
        })
  return {
    id: row.id,
    profile_id: row.profile_id,
    title,
    body,
    type: row.type,
    action_url,
    read: !!row.read,
    created_at: row.created_at,
  }
}

export function encryptNotificationWrite(
  profileId: string,
  input: NotificationWrite,
  notificationId: string,
): NotificationInsertShape {
  const title_enc = encryptForUser({
    userId: profileId,
    plaintext: input.title,
    table: TABLE,
    column: "title",
    rowId: notificationId,
  })
  const body_enc = encryptForUser({
    userId: profileId,
    plaintext: input.body,
    table: TABLE,
    column: "body",
    rowId: notificationId,
  })
  const action_url_enc =
    input.action_url === undefined || input.action_url === null
      ? null
      : encryptForUser({
          userId: profileId,
          plaintext: input.action_url,
          table: TABLE,
          column: "action_url",
          rowId: notificationId,
        })
  const shape: NotificationInsertShape = {
    id: notificationId,
    profile_id: profileId,
    title_enc,
    body_enc,
    action_url_enc,
  }
  if (input.type !== undefined) shape.type = input.type
  return shape
}

export function encryptNotificationUpdate(
  profileId: string,
  notificationId: string,
  patch: Partial<NotificationWrite> & { read?: boolean },
): NotificationUpdateShape {
  const out: NotificationUpdateShape = {}
  if (patch.title !== undefined) {
    out.title_enc = encryptForUser({
      userId: profileId,
      plaintext: patch.title,
      table: TABLE,
      column: "title",
      rowId: notificationId,
    })
  }
  if (patch.body !== undefined) {
    out.body_enc = encryptForUser({
      userId: profileId,
      plaintext: patch.body,
      table: TABLE,
      column: "body",
      rowId: notificationId,
    })
  }
  if (patch.action_url !== undefined) {
    out.action_url_enc =
      patch.action_url === null
        ? null
        : encryptForUser({
            userId: profileId,
            plaintext: patch.action_url,
            table: TABLE,
            column: "action_url",
            rowId: notificationId,
          })
  }
  if (patch.type !== undefined) out.type = patch.type
  if (patch.read !== undefined) out.read = patch.read
  return out
}

// --- Async repo API --------------------------------------------------------

const SELECT_COLS =
  "id, profile_id, title_enc, body_enc, action_url_enc, type, read, created_at"

export async function getNotification(
  supabase: SupabaseClient,
  profileId: string,
  notificationId: string,
): Promise<Notification | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_COLS)
      .eq("id", notificationId)
      .eq("profile_id", profileId)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    return decryptNotificationRow(profileId, data as NotificationEncryptedRow)
  })
}

export async function listNotifications(
  supabase: SupabaseClient,
  profileId: string,
  opts?: { read?: boolean; type?: string; limit?: number; offset?: number },
): Promise<Notification[]> {
  return withCryptoRequestScope(async () => {
    let query = supabase
      .from(TABLE)
      .select(SELECT_COLS)
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
    if (typeof opts?.read === "boolean") query = query.eq("read", opts.read)
    if (opts?.type) query = query.eq("type", opts.type)
    if (typeof opts?.limit === "number" && typeof opts?.offset === "number") {
      query = query.range(opts.offset, opts.offset + opts.limit - 1)
    } else if (typeof opts?.limit === "number") {
      query = query.limit(opts.limit)
    }
    const { data, error } = await query
    if (error) throw error
    const rows = (data ?? []) as NotificationEncryptedRow[]
    return rows.map((r) => decryptNotificationRow(profileId, r))
  })
}

export async function createNotification(
  supabase: SupabaseClient,
  profileId: string,
  input: NotificationWrite,
): Promise<Notification> {
  return withCryptoRequestScope(async () => {
    const notificationId = randomUUID()
    const shape = encryptNotificationWrite(profileId, input, notificationId)
    const { data, error } = await supabase
      .from(TABLE)
      .insert(shape)
      .select(SELECT_COLS)
      .single()
    if (error) throw error
    return decryptNotificationRow(profileId, data as NotificationEncryptedRow)
  })
}

export async function markNotificationRead(
  supabase: SupabaseClient,
  profileId: string,
  notificationId: string,
  read: boolean = true,
): Promise<Notification> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ read })
      .eq("id", notificationId)
      .eq("profile_id", profileId)
      .select(SELECT_COLS)
      .single()
    if (error) throw error
    return decryptNotificationRow(profileId, data as NotificationEncryptedRow)
  })
}

// Bulk fan-out create. One Supabase insert call per item so each row's AAD is
// bound to its own freshly-minted UUID (we cannot share a single batch insert
// if the IDs must be generated client-side, because AAD = "...:{rowId}").
export async function createUserNotificationBulk(
  supabase: SupabaseClient,
  items: Array<{ profileId: string; input: NotificationWrite }>,
): Promise<Notification[]> {
  return withCryptoRequestScope(async () => {
    const out: Notification[] = []
    for (const { profileId, input } of items) {
      const notificationId = randomUUID()
      const shape = encryptNotificationWrite(profileId, input, notificationId)
      const { data, error } = await supabase
        .from(TABLE)
        .insert(shape)
        .select(SELECT_COLS)
        .single()
      if (error) throw error
      out.push(decryptNotificationRow(profileId, data as NotificationEncryptedRow))
    }
    return out
  })
}

// --- Admin (service-role) helpers -----------------------------------------

export async function getNotificationForAdmin(
  supabase: SupabaseClient,
  notificationId: string,
): Promise<Notification | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_COLS)
      .eq("id", notificationId)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    const row = data as NotificationEncryptedRow
    return decryptNotificationRow(row.profile_id, row)
  })
}

export async function listNotificationsForAdmin(
  supabase: SupabaseClient,
  opts?: { read?: boolean; type?: string; limit?: number; offset?: number },
): Promise<Notification[]> {
  return withCryptoRequestScope(async () => {
    let query = supabase
      .from(TABLE)
      .select(SELECT_COLS)
      .order("created_at", { ascending: false })
    if (typeof opts?.read === "boolean") query = query.eq("read", opts.read)
    if (opts?.type) query = query.eq("type", opts.type)
    if (typeof opts?.limit === "number" && typeof opts?.offset === "number") {
      query = query.range(opts.offset, opts.offset + opts.limit - 1)
    } else if (typeof opts?.limit === "number") {
      query = query.limit(opts.limit)
    }
    const { data, error } = await query
    if (error) throw error
    const rows = (data ?? []) as NotificationEncryptedRow[]
    return rows.map((r) => decryptNotificationRow(r.profile_id, r))
  })
}
