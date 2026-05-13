// Ticket messages repository — encrypt-on-write, decrypt-on-read.
// Tenant key = profile_id (denormalized, assumes column exists post-mig-037).
// AAD = "ticket_messages:{column}:{row.id}".
//
// Encrypted columns: message -> message_enc TEXT.
// Plain columns: id, ticket_id, profile_id, user_id, is_admin, created_at.
import { randomUUID } from "node:crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  encryptForUser,
  decryptForUser,
  withCryptoRequestScope,
} from "@/lib/crypto"

const TABLE = "ticket_messages"

export interface TicketMessage {
  id: string
  ticket_id: string
  profile_id: string
  user_id: string | null
  is_admin: boolean
  message: string
  created_at: string
}

export interface TicketMessageWrite {
  ticket_id: string
  profile_id: string
  user_id?: string | null
  is_admin?: boolean
  message: string
}

export interface TicketMessageEncryptedRow {
  id: string
  ticket_id: string
  profile_id: string
  user_id: string | null
  is_admin: boolean
  message_enc: string | null
  // Plaintext fallback for rows written before 037 backfill ran.
  message?: string | null
  created_at: string
}

export interface TicketMessageInsertShape {
  id: string
  ticket_id: string
  profile_id: string
  user_id: string | null
  is_admin?: boolean
  message_enc: string
}

export interface TicketMessageUpdateShape {
  message_enc?: string
  is_admin?: boolean
}

// --- Pure transforms -------------------------------------------------------

export function decryptTicketMessageRow(
  profileId: string,
  row: TicketMessageEncryptedRow,
): TicketMessage {
  const message =
    row.message_enc === null || row.message_enc === undefined
      ? // Fall back to legacy plaintext column if it's still present (pre-038).
        (row.message ?? "")
      : decryptForUser({
          userId: profileId,
          envelope: row.message_enc,
          table: TABLE,
          column: "message",
          rowId: row.id,
        })
  return {
    id: row.id,
    ticket_id: row.ticket_id,
    profile_id: row.profile_id,
    user_id: row.user_id ?? null,
    is_admin: !!row.is_admin,
    message,
    created_at: row.created_at,
  }
}

export function encryptTicketMessageWrite(
  profileId: string,
  input: TicketMessageWrite,
  messageId: string,
): TicketMessageInsertShape {
  if (input.profile_id !== profileId) {
    throw new Error("encryptTicketMessageWrite: profileId mismatch with input.profile_id")
  }
  const message_enc = encryptForUser({
    userId: profileId,
    plaintext: input.message,
    table: TABLE,
    column: "message",
    rowId: messageId,
  })
  const shape: TicketMessageInsertShape = {
    id: messageId,
    ticket_id: input.ticket_id,
    profile_id: profileId,
    user_id: input.user_id ?? null,
    message_enc,
  }
  if (input.is_admin !== undefined) shape.is_admin = input.is_admin
  return shape
}

export function encryptTicketMessageUpdate(
  profileId: string,
  messageId: string,
  patch: Partial<TicketMessageWrite>,
): TicketMessageUpdateShape {
  const out: TicketMessageUpdateShape = {}
  if (patch.message !== undefined) {
    out.message_enc = encryptForUser({
      userId: profileId,
      plaintext: patch.message,
      table: TABLE,
      column: "message",
      rowId: messageId,
    })
  }
  if (patch.is_admin !== undefined) out.is_admin = patch.is_admin
  return out
}

// --- Async repo API --------------------------------------------------------

// `message` is the legacy plaintext column read for backfill-fallback during
// the 037 -> 038 transition. After migration 038 drops it, remove from this
// list (Postgres errors if you select a dropped column).
const SELECT_COLS =
  "id, ticket_id, profile_id, user_id, is_admin, message_enc, message, created_at"

export async function getTicketMessage(
  supabase: SupabaseClient,
  profileId: string,
  messageId: string,
): Promise<TicketMessage | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_COLS)
      .eq("id", messageId)
      .eq("profile_id", profileId)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    return decryptTicketMessageRow(profileId, data as TicketMessageEncryptedRow)
  })
}

export async function listTicketMessages(
  supabase: SupabaseClient,
  profileId: string,
  opts?: { ticket_id?: string; limit?: number; offset?: number },
): Promise<TicketMessage[]> {
  return withCryptoRequestScope(async () => {
    let query = supabase
      .from(TABLE)
      .select(SELECT_COLS)
      .eq("profile_id", profileId)
      .order("created_at", { ascending: true })
    if (opts?.ticket_id) query = query.eq("ticket_id", opts.ticket_id)
    if (typeof opts?.limit === "number" && typeof opts?.offset === "number") {
      query = query.range(opts.offset, opts.offset + opts.limit - 1)
    } else if (typeof opts?.limit === "number") {
      query = query.limit(opts.limit)
    }
    const { data, error } = await query
    if (error) throw error
    const rows = (data ?? []) as TicketMessageEncryptedRow[]
    return rows.map((r) => decryptTicketMessageRow(profileId, r))
  })
}

export async function createTicketMessage(
  supabase: SupabaseClient,
  input: TicketMessageWrite,
): Promise<TicketMessage> {
  return withCryptoRequestScope(async () => {
    const messageId = randomUUID()
    const shape = encryptTicketMessageWrite(input.profile_id, input, messageId)
    const { data, error } = await supabase
      .from(TABLE)
      .insert(shape)
      .select(SELECT_COLS)
      .single()
    if (error) throw error
    return decryptTicketMessageRow(input.profile_id, data as TicketMessageEncryptedRow)
  })
}

// --- Admin (service-role) helpers -----------------------------------------

export async function getTicketMessageForAdmin(
  supabase: SupabaseClient,
  messageId: string,
): Promise<TicketMessage | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_COLS)
      .eq("id", messageId)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    const row = data as TicketMessageEncryptedRow
    return decryptTicketMessageRow(row.profile_id, row)
  })
}

export async function listTicketMessagesForAdmin(
  supabase: SupabaseClient,
  opts?: { ticket_id?: string; limit?: number; offset?: number },
): Promise<TicketMessage[]> {
  return withCryptoRequestScope(async () => {
    let query = supabase
      .from(TABLE)
      .select(SELECT_COLS)
      .order("created_at", { ascending: true })
    if (opts?.ticket_id) query = query.eq("ticket_id", opts.ticket_id)
    if (typeof opts?.limit === "number" && typeof opts?.offset === "number") {
      query = query.range(opts.offset, opts.offset + opts.limit - 1)
    } else if (typeof opts?.limit === "number") {
      query = query.limit(opts.limit)
    }
    const { data, error } = await query
    if (error) throw error
    const rows = (data ?? []) as TicketMessageEncryptedRow[]
    return rows.map((r) => decryptTicketMessageRow(r.profile_id, r))
  })
}
