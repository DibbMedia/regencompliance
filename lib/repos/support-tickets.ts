// Support tickets repository — encrypt-on-write, decrypt-on-read.
// Tenant key = profile_id. AAD = "support_tickets:{column}:{row.id}".
//
// Encrypted columns: subject -> subject_enc TEXT.
// Plain columns: id, profile_id, user_id, status, priority, created_at, updated_at.
//
// All reads + writes are wrapped in withCryptoRequestScope so a single request
// reusing the same profile DEK pays HKDF once.
import { randomUUID } from "node:crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  encryptForUser,
  decryptForUser,
  withCryptoRequestScope,
} from "@/lib/crypto"

const TABLE = "support_tickets"

export interface Ticket {
  id: string
  profile_id: string
  user_id: string | null
  subject: string
  status: string
  priority: string
  created_at: string
  updated_at: string
}

export interface TicketWrite {
  profile_id: string
  user_id?: string | null
  subject: string
  status?: string
  priority?: string
}

export interface TicketEncryptedRow {
  id: string
  profile_id: string
  user_id: string | null
  subject_enc: string | null
  // Plaintext fallback for rows written before 037 backfill ran. Goes away
  // when migration 038 drops the column.
  subject?: string | null
  status: string
  priority: string
  created_at: string
  updated_at: string
}

export interface TicketInsertShape {
  id: string
  profile_id: string
  user_id: string | null
  subject_enc: string
  status?: string
  priority?: string
}

export interface TicketUpdateShape {
  subject_enc?: string
  status?: string
  priority?: string
  user_id?: string | null
}

// --- Pure transforms -------------------------------------------------------

export function decryptTicketRow(profileId: string, row: TicketEncryptedRow): Ticket {
  const subject =
    row.subject_enc === null || row.subject_enc === undefined
      ? // Fall back to legacy plaintext column if it's still present (pre-038).
        (row.subject ?? "")
      : decryptForUser({
          userId: profileId,
          envelope: row.subject_enc,
          table: TABLE,
          column: "subject",
          rowId: row.id,
        })
  return {
    id: row.id,
    profile_id: row.profile_id,
    user_id: row.user_id ?? null,
    subject,
    status: row.status,
    priority: row.priority,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function encryptTicketWrite(
  profileId: string,
  input: TicketWrite,
  ticketId: string,
): TicketInsertShape {
  if (input.profile_id !== profileId) {
    throw new Error("encryptTicketWrite: profileId mismatch with input.profile_id")
  }
  const subject_enc = encryptForUser({
    userId: profileId,
    plaintext: input.subject,
    table: TABLE,
    column: "subject",
    rowId: ticketId,
  })
  const shape: TicketInsertShape = {
    id: ticketId,
    profile_id: profileId,
    user_id: input.user_id ?? null,
    subject_enc,
  }
  if (input.status !== undefined) shape.status = input.status
  if (input.priority !== undefined) shape.priority = input.priority
  return shape
}

export function encryptTicketUpdate(
  profileId: string,
  ticketId: string,
  patch: Partial<TicketWrite>,
): TicketUpdateShape {
  const out: TicketUpdateShape = {}
  if (patch.subject !== undefined) {
    out.subject_enc = encryptForUser({
      userId: profileId,
      plaintext: patch.subject,
      table: TABLE,
      column: "subject",
      rowId: ticketId,
    })
  }
  if (patch.status !== undefined) out.status = patch.status
  if (patch.priority !== undefined) out.priority = patch.priority
  if (patch.user_id !== undefined) out.user_id = patch.user_id
  return out
}

// --- Async repo API --------------------------------------------------------

// `subject` is the legacy plaintext column read for backfill-fallback during
// the 037 -> 038 transition. After migration 038 drops it, remove `subject`
// from this list (Postgres will error if you select a dropped column).
const SELECT_COLS =
  "id, profile_id, user_id, subject_enc, subject, status, priority, created_at, updated_at"

export async function getTicket(
  supabase: SupabaseClient,
  profileId: string,
  ticketId: string,
): Promise<Ticket | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_COLS)
      .eq("id", ticketId)
      .eq("profile_id", profileId)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    return decryptTicketRow(profileId, data as TicketEncryptedRow)
  })
}

export async function listTickets(
  supabase: SupabaseClient,
  profileId: string,
  opts?: { status?: string; limit?: number; offset?: number },
): Promise<Ticket[]> {
  return withCryptoRequestScope(async () => {
    let query = supabase
      .from(TABLE)
      .select(SELECT_COLS)
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
    if (opts?.status) query = query.eq("status", opts.status)
    if (typeof opts?.limit === "number" && typeof opts?.offset === "number") {
      query = query.range(opts.offset, opts.offset + opts.limit - 1)
    } else if (typeof opts?.limit === "number") {
      query = query.limit(opts.limit)
    }
    const { data, error } = await query
    if (error) throw error
    const rows = (data ?? []) as TicketEncryptedRow[]
    return rows.map((r) => decryptTicketRow(profileId, r))
  })
}

export async function createTicket(
  supabase: SupabaseClient,
  input: TicketWrite,
): Promise<Ticket> {
  return withCryptoRequestScope(async () => {
    const ticketId = randomUUID()
    const shape = encryptTicketWrite(input.profile_id, input, ticketId)
    const { data, error } = await supabase
      .from(TABLE)
      .insert(shape)
      .select(SELECT_COLS)
      .single()
    if (error) throw error
    return decryptTicketRow(input.profile_id, data as TicketEncryptedRow)
  })
}

export async function updateTicketStatus(
  supabase: SupabaseClient,
  profileId: string,
  ticketId: string,
  status: string,
): Promise<Ticket> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", ticketId)
      .eq("profile_id", profileId)
      .select(SELECT_COLS)
      .single()
    if (error) throw error
    return decryptTicketRow(profileId, data as TicketEncryptedRow)
  })
}

// --- Admin (service-role) helpers -----------------------------------------

export async function getTicketForAdmin(
  supabase: SupabaseClient,
  ticketId: string,
): Promise<Ticket | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_COLS)
      .eq("id", ticketId)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    const row = data as TicketEncryptedRow
    return decryptTicketRow(row.profile_id, row)
  })
}

export async function listTicketsForAdmin(
  supabase: SupabaseClient,
  opts?: { status?: string; limit?: number; offset?: number },
): Promise<Ticket[]> {
  return withCryptoRequestScope(async () => {
    let query = supabase
      .from(TABLE)
      .select(SELECT_COLS)
      .order("created_at", { ascending: false })
    if (opts?.status) query = query.eq("status", opts.status)
    if (typeof opts?.limit === "number" && typeof opts?.offset === "number") {
      query = query.range(opts.offset, opts.offset + opts.limit - 1)
    } else if (typeof opts?.limit === "number") {
      query = query.limit(opts.limit)
    }
    const { data, error } = await query
    if (error) throw error
    const rows = (data ?? []) as TicketEncryptedRow[]
    return rows.map((r) => decryptTicketRow(r.profile_id, r))
  })
}
