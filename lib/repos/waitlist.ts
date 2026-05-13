// Waitlist repository — pre-auth lead capture.
//
// Per-row DEK keyed off `row.id`. AAD = `waitlist:{column}:{row.id}`.
// Plaintext columns: id, source, created_at, launch_email_sent_at.
// Encrypted columns: email, name, ip_address, user_agent (all → *_enc TEXT).
//
// All callers must wrap reads + writes in `withCryptoRequestScope` from
// `lib/crypto.ts` so per-row DEK derivation is cached for the request.
import { randomUUID } from "node:crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  decryptForRow,
  encryptForRow,
  withCryptoRequestScope,
} from "@/lib/crypto"

const TABLE = "waitlist"

export interface WaitlistEntry {
  id: string
  email: string
  name: string | null
  ip_address: string | null
  user_agent: string | null
  source: string | null
  created_at: string
  launch_email_sent_at: string | null
}

export interface WaitlistWrite {
  email: string
  name?: string | null
  ip_address?: string | null
  user_agent?: string | null
  source?: string | null
}

export interface WaitlistEncryptedRow {
  id: string
  email_enc: string | null
  name_enc: string | null
  ip_address_enc: string | null
  user_agent_enc: string | null
  source: string | null
  created_at: string
  launch_email_sent_at: string | null
  // Plaintext fallbacks (read-only): present on rows written before the
  // Phase 6 cutover (mig 041 added *_enc; mig 042 drops these). Repo
  // decrypt path prefers *_enc when set and falls back to plaintext
  // when *_enc is NULL, so reads keep working across the transition.
  email?: string | null
  name?: string | null
  ip_address?: string | null
  user_agent?: string | null
}

export interface WaitlistInsertShape {
  id: string
  email_enc: string
  name_enc: string | null
  ip_address_enc: string | null
  user_agent_enc: string | null
  source: string | null
}

function encOpt(rowId: string, column: string, value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null
  return encryptForRow({ rowId, plaintext: value, table: TABLE, column })
}

function decOpt(rowId: string, column: string, envelope: string | null | undefined): string | null {
  if (envelope === null || envelope === undefined) return null
  return decryptForRow({ rowId, envelope, table: TABLE, column })
}

export function decryptWaitlistRow(row: WaitlistEncryptedRow): WaitlistEntry {
  // Plaintext fallback during the mig 041 -> backfill -> mig 042 transition:
  // if *_enc is NULL, the row was written before encryption rolled out.
  // After mig 042 drops the plaintext columns, the fallback branch is dead
  // but the conditional is cheap; keep it for any historical re-import.
  const email = row.email_enc
    ? decryptForRow({ rowId: row.id, envelope: row.email_enc, table: TABLE, column: "email" })
    : row.email ?? ""
  return {
    id: row.id,
    email,
    name: row.name_enc
      ? decOpt(row.id, "name", row.name_enc)
      : row.name ?? null,
    ip_address: row.ip_address_enc
      ? decOpt(row.id, "ip_address", row.ip_address_enc)
      : row.ip_address ?? null,
    user_agent: row.user_agent_enc
      ? decOpt(row.id, "user_agent", row.user_agent_enc)
      : row.user_agent ?? null,
    source: row.source,
    created_at: row.created_at,
    launch_email_sent_at: row.launch_email_sent_at,
  }
}

export function encryptWaitlistWrite(input: WaitlistWrite, rowId: string): WaitlistInsertShape {
  return {
    id: rowId,
    email_enc: encryptForRow({
      rowId,
      plaintext: input.email,
      table: TABLE,
      column: "email",
    }),
    name_enc: encOpt(rowId, "name", input.name ?? null),
    ip_address_enc: encOpt(rowId, "ip_address", input.ip_address ?? null),
    user_agent_enc: encOpt(rowId, "user_agent", input.user_agent ?? null),
    source: input.source ?? null,
  }
}

export async function createWaitlistEntry(
  supabase: SupabaseClient,
  input: WaitlistWrite,
): Promise<WaitlistEntry> {
  return withCryptoRequestScope(async () => {
    const id = randomUUID()
    const payload = encryptWaitlistWrite(input, id)
    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select("*")
      .single()
    if (error) throw error
    return decryptWaitlistRow(data as WaitlistEncryptedRow)
  })
}

export async function getWaitlistEntry(
  supabase: SupabaseClient,
  id: string,
): Promise<WaitlistEntry | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    return decryptWaitlistRow(data as WaitlistEncryptedRow)
  })
}

export async function listWaitlistForAdmin(
  supabase: SupabaseClient,
  opts: {
    limit?: number
    offset?: number
    orderBy?: "created_at"
    order?: "asc" | "desc"
  } = {},
): Promise<WaitlistEntry[]> {
  const limit = opts.limit ?? 50
  const offset = opts.offset ?? 0
  const orderBy = opts.orderBy ?? "created_at"
  const ascending = (opts.order ?? "desc") === "asc"
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1)
    if (error) throw error
    return (data as WaitlistEncryptedRow[]).map(decryptWaitlistRow)
  })
}

export async function deleteWaitlistEntry(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id)
  if (error) throw error
}

export async function markWaitlistLaunchSent(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ launch_email_sent_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw error
}

export async function listUnsentWaitlist(
  supabase: SupabaseClient,
): Promise<WaitlistEntry[]> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .is("launch_email_sent_at", null)
      .order("created_at", { ascending: true })
    if (error) throw error
    return (data as WaitlistEncryptedRow[]).map(decryptWaitlistRow)
  })
}
