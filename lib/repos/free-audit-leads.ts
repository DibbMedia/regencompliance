// Free-audit-leads repository — pre-auth lead magnet (URL audit).
//
// Per-row DEK keyed off `row.id`. AAD = `free_audit_leads:{column}:{row.id}`.
// Plaintext columns: id, compliance_score, flag_count, *_risk_count, source,
//   created_at (also status, but admin status updates go through a dedicated
//   helper that doesn't touch plaintext PII).
// Encrypted columns:
//   - email, website_url, page_title, ip_address, user_agent → *_enc TEXT
//   - flags (JSONB) → flags_enc TEXT (encryptJSONForRow)
//
// All callers must wrap reads + writes in `withCryptoRequestScope`.
import { randomUUID } from "node:crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  decryptForRow,
  decryptJSONForRow,
  encryptForRow,
  encryptJSONForRow,
  withCryptoRequestScope,
} from "@/lib/crypto"

const TABLE = "free_audit_leads"

// `flags` is opaque Claude output (per migration 027). Keep `unknown`-typed
// here so the repo stays generic; consumers cast or type-guard.
export type FreeAuditFlags = unknown

export interface FreeAuditLead {
  id: string
  email: string
  website_url: string
  page_title: string | null
  compliance_score: number | null
  flag_count: number | null
  high_risk_count: number | null
  medium_risk_count: number | null
  low_risk_count: number | null
  flags: FreeAuditFlags | null
  ip_address: string | null
  user_agent: string | null
  source: string | null
  created_at: string
}

export interface FreeAuditLeadWrite {
  email: string
  website_url: string
  page_title?: string | null
  compliance_score?: number | null
  flag_count?: number | null
  high_risk_count?: number | null
  medium_risk_count?: number | null
  low_risk_count?: number | null
  flags?: FreeAuditFlags | null
  ip_address?: string | null
  user_agent?: string | null
  source?: string | null
}

export interface FreeAuditLeadEncryptedRow {
  id: string
  email_enc: string
  website_url_enc: string
  page_title_enc: string | null
  compliance_score: number | null
  flag_count: number | null
  high_risk_count: number | null
  medium_risk_count: number | null
  low_risk_count: number | null
  flags_enc: string | null
  ip_address_enc: string | null
  user_agent_enc: string | null
  source: string | null
  created_at: string
}

export interface FreeAuditLeadInsertShape {
  id: string
  email_enc: string
  website_url_enc: string
  page_title_enc: string | null
  compliance_score: number | null
  flag_count: number | null
  high_risk_count: number | null
  medium_risk_count: number | null
  low_risk_count: number | null
  flags_enc: string | null
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

export function decryptFreeAuditLeadRow(row: FreeAuditLeadEncryptedRow): FreeAuditLead {
  return {
    id: row.id,
    email: dec(row.id, "email", row.email_enc),
    website_url: dec(row.id, "website_url", row.website_url_enc),
    page_title: decOpt(row.id, "page_title", row.page_title_enc),
    compliance_score: row.compliance_score,
    flag_count: row.flag_count,
    high_risk_count: row.high_risk_count,
    medium_risk_count: row.medium_risk_count,
    low_risk_count: row.low_risk_count,
    flags:
      row.flags_enc === null || row.flags_enc === undefined
        ? null
        : decryptJSONForRow<FreeAuditFlags>({
            rowId: row.id,
            envelope: row.flags_enc,
            table: TABLE,
            column: "flags",
          }),
    ip_address: decOpt(row.id, "ip_address", row.ip_address_enc),
    user_agent: decOpt(row.id, "user_agent", row.user_agent_enc),
    source: row.source,
    created_at: row.created_at,
  }
}

export function encryptFreeAuditLeadWrite(
  input: FreeAuditLeadWrite,
  rowId: string,
): FreeAuditLeadInsertShape {
  return {
    id: rowId,
    email_enc: enc(rowId, "email", input.email),
    website_url_enc: enc(rowId, "website_url", input.website_url),
    page_title_enc: encOpt(rowId, "page_title", input.page_title ?? null),
    compliance_score: input.compliance_score ?? null,
    flag_count: input.flag_count ?? null,
    high_risk_count: input.high_risk_count ?? null,
    medium_risk_count: input.medium_risk_count ?? null,
    low_risk_count: input.low_risk_count ?? null,
    flags_enc:
      input.flags === null || input.flags === undefined
        ? null
        : encryptJSONForRow({
            rowId,
            payload: input.flags,
            table: TABLE,
            column: "flags",
          }),
    ip_address_enc: encOpt(rowId, "ip_address", input.ip_address ?? null),
    user_agent_enc: encOpt(rowId, "user_agent", input.user_agent ?? null),
    source: input.source ?? null,
  }
}

export async function createFreeAuditLead(
  supabase: SupabaseClient,
  input: FreeAuditLeadWrite,
): Promise<FreeAuditLead> {
  return withCryptoRequestScope(async () => {
    const id = randomUUID()
    const payload = encryptFreeAuditLeadWrite(input, id)
    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select("*")
      .single()
    if (error) throw error
    return decryptFreeAuditLeadRow(data as FreeAuditLeadEncryptedRow)
  })
}

export async function getFreeAuditLead(
  supabase: SupabaseClient,
  id: string,
): Promise<FreeAuditLead | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    return decryptFreeAuditLeadRow(data as FreeAuditLeadEncryptedRow)
  })
}

export async function listFreeAuditLeadsForAdmin(
  supabase: SupabaseClient,
  opts: {
    limit?: number
    offset?: number
    orderBy?: "created_at"
    order?: "asc" | "desc"
  } = {},
): Promise<FreeAuditLead[]> {
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
    return (data as FreeAuditLeadEncryptedRow[]).map(decryptFreeAuditLeadRow)
  })
}

export async function deleteFreeAuditLead(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id)
  if (error) throw error
}
