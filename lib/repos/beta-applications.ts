// Beta-applications repository — pre-auth founder-beta intake.
//
// Per-row DEK keyed off `row.id`. AAD = `beta_applications:{column}:{row.id}`.
// Plaintext columns: id, source, accepted_terms_at, created_at.
// Encrypted columns (all → *_enc TEXT): name, email, clinic_name, specialty,
//   role, website, monthly_volume, why_apply, ip_address, user_agent.
//
// website is the only inherently-optional encrypted column (migration 025 lets
// it be NULL); the rest are NOT NULL at the DB level but we accept null/undef
// inputs gracefully so the repo stays usable from admin tooling.
//
// All callers must wrap reads + writes in `withCryptoRequestScope`.
import { randomUUID } from "node:crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  decryptForRow,
  encryptForRow,
  withCryptoRequestScope,
} from "@/lib/crypto"

const TABLE = "beta_applications"

export interface BetaApplication {
  id: string
  name: string
  email: string
  clinic_name: string
  specialty: string
  role: string
  website: string | null
  monthly_volume: string
  why_apply: string
  ip_address: string | null
  user_agent: string | null
  source: string | null
  accepted_terms_at: string
  created_at: string
}

export interface BetaApplicationWrite {
  name: string
  email: string
  clinic_name: string
  specialty: string
  role: string
  website?: string | null
  monthly_volume: string
  why_apply: string
  ip_address?: string | null
  user_agent?: string | null
  source?: string | null
}

export interface BetaApplicationEncryptedRow {
  id: string
  name_enc: string | null
  email_enc: string | null
  clinic_name_enc: string | null
  specialty_enc: string | null
  role_enc: string | null
  website_enc: string | null
  monthly_volume_enc: string | null
  why_apply_enc: string | null
  ip_address_enc: string | null
  user_agent_enc: string | null
  source: string | null
  accepted_terms_at: string
  created_at: string
  // Plaintext fallbacks (mig 041 -> backfill -> mig 042 transition).
  name?: string | null
  email?: string | null
  clinic_name?: string | null
  specialty?: string | null
  role?: string | null
  website?: string | null
  monthly_volume?: string | null
  why_apply?: string | null
  ip_address?: string | null
  user_agent?: string | null
}

export interface BetaApplicationInsertShape {
  id: string
  name_enc: string
  email_enc: string
  clinic_name_enc: string
  specialty_enc: string
  role_enc: string
  website_enc: string | null
  monthly_volume_enc: string
  why_apply_enc: string
  ip_address_enc: string | null
  user_agent_enc: string | null
  source: string | null
}

function enc(rowId: string, column: string, value: string): string {
  return encryptForRow({ rowId, plaintext: value, table: TABLE, column })
}

function encOpt(rowId: string, column: string, value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null
  return encryptForRow({ rowId, plaintext: value, table: TABLE, column })
}

function dec(rowId: string, column: string, envelope: string): string {
  return decryptForRow({ rowId, envelope, table: TABLE, column })
}

function decOpt(rowId: string, column: string, envelope: string | null | undefined): string | null {
  if (envelope === null || envelope === undefined) return null
  return decryptForRow({ rowId, envelope, table: TABLE, column })
}

// Dual-read: prefer *_enc, fall back to the plaintext column when *_enc is NULL.
// After mig 042 drops the plaintext side the fallback branch is dead; the
// conditional stays as a defense against any historical re-import.
function readReq(rowId: string, column: string, enc: string | null, plain: string | null | undefined): string {
  if (enc) return dec(rowId, column, enc)
  return plain ?? ""
}
function readOpt(rowId: string, column: string, enc: string | null, plain: string | null | undefined): string | null {
  if (enc) return decOpt(rowId, column, enc)
  return plain ?? null
}

export function decryptBetaApplicationRow(row: BetaApplicationEncryptedRow): BetaApplication {
  return {
    id: row.id,
    name: readReq(row.id, "name", row.name_enc, row.name),
    email: readReq(row.id, "email", row.email_enc, row.email),
    clinic_name: readReq(row.id, "clinic_name", row.clinic_name_enc, row.clinic_name),
    specialty: readReq(row.id, "specialty", row.specialty_enc, row.specialty),
    role: readReq(row.id, "role", row.role_enc, row.role),
    website: readOpt(row.id, "website", row.website_enc, row.website),
    monthly_volume: readReq(row.id, "monthly_volume", row.monthly_volume_enc, row.monthly_volume),
    why_apply: readReq(row.id, "why_apply", row.why_apply_enc, row.why_apply),
    ip_address: readOpt(row.id, "ip_address", row.ip_address_enc, row.ip_address),
    user_agent: readOpt(row.id, "user_agent", row.user_agent_enc, row.user_agent),
    source: row.source,
    accepted_terms_at: row.accepted_terms_at,
    created_at: row.created_at,
  }
}

export function encryptBetaApplicationWrite(
  input: BetaApplicationWrite,
  rowId: string,
): BetaApplicationInsertShape {
  return {
    id: rowId,
    name_enc: enc(rowId, "name", input.name),
    email_enc: enc(rowId, "email", input.email),
    clinic_name_enc: enc(rowId, "clinic_name", input.clinic_name),
    specialty_enc: enc(rowId, "specialty", input.specialty),
    role_enc: enc(rowId, "role", input.role),
    website_enc: encOpt(rowId, "website", input.website ?? null),
    monthly_volume_enc: enc(rowId, "monthly_volume", input.monthly_volume),
    why_apply_enc: enc(rowId, "why_apply", input.why_apply),
    ip_address_enc: encOpt(rowId, "ip_address", input.ip_address ?? null),
    user_agent_enc: encOpt(rowId, "user_agent", input.user_agent ?? null),
    source: input.source ?? null,
  }
}

export async function createBetaApplication(
  supabase: SupabaseClient,
  input: BetaApplicationWrite,
): Promise<BetaApplication> {
  return withCryptoRequestScope(async () => {
    const id = randomUUID()
    const payload = encryptBetaApplicationWrite(input, id)
    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select("*")
      .single()
    if (error) throw error
    return decryptBetaApplicationRow(data as BetaApplicationEncryptedRow)
  })
}

export async function getBetaApplication(
  supabase: SupabaseClient,
  id: string,
): Promise<BetaApplication | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    return decryptBetaApplicationRow(data as BetaApplicationEncryptedRow)
  })
}

export async function listBetaApplicationsForAdmin(
  supabase: SupabaseClient,
  opts: {
    limit?: number
    offset?: number
    orderBy?: "created_at"
    order?: "asc" | "desc"
  } = {},
): Promise<BetaApplication[]> {
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
    return (data as BetaApplicationEncryptedRow[]).map(decryptBetaApplicationRow)
  })
}

export async function deleteBetaApplication(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id)
  if (error) throw error
}
