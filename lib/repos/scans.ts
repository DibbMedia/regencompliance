// Repository for the `scans` table.
//
// Tenant key: `profile_id` (per-user DEK; userId = profile_id).
// AAD: `scans:{column}:{row.id}`.
//
// Encrypted columns (Phase 3 / migration 035):
//   - `original_text`    -> `original_text_enc TEXT`
//   - `rewritten_text`   -> `rewritten_text_enc TEXT`
//   - `flags` (JSONB)    -> `flags_enc TEXT` (JSON serialized then encrypted)
//   - `source_url`       -> `source_url_enc TEXT`
//
// Pass-through columns (stay plaintext): id, profile_id, user_id, content_type,
//   compliance_score, flag_count, *_risk_count, scan_duration_ms, created_at.
//
// NULL ciphertext -> null plaintext (don't attempt to decrypt).
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  decryptForUser,
  decryptJSONForUser,
  encryptForUser,
  encryptJSONForUser,
  withCryptoRequestScope,
} from "@/lib/crypto"
import type { ScanFlag } from "@/lib/types"

const TABLE = "scans"

export interface Scan {
  id: string
  profile_id: string
  user_id: string | null
  content_type: string
  original_text: string
  rewritten_text: string | null
  flags: ScanFlag[]
  source_url: string | null
  compliance_score: number | null
  flag_count: number
  high_risk_count: number
  medium_risk_count: number
  low_risk_count: number
  scan_duration_ms: number | null
  created_at: string
}

export interface ScanWrite {
  id?: string
  profile_id: string
  user_id?: string | null
  content_type: string
  original_text: string
  rewritten_text?: string | null
  flags?: ScanFlag[]
  source_url?: string | null
  compliance_score?: number | null
  flag_count?: number
  high_risk_count?: number
  medium_risk_count?: number
  low_risk_count?: number
  scan_duration_ms?: number | null
  created_at?: string
}

export interface ScanEncryptedRow {
  id: string
  profile_id: string
  user_id: string | null
  content_type: string
  original_text_enc: string | null
  rewritten_text_enc: string | null
  flags_enc: string | null
  source_url_enc: string | null
  compliance_score: number | null
  flag_count: number
  high_risk_count: number
  medium_risk_count: number
  low_risk_count: number
  scan_duration_ms: number | null
  created_at: string
}

export interface ScanInsert {
  id?: string
  profile_id: string
  user_id?: string | null
  content_type: string
  original_text_enc: string | null
  rewritten_text_enc: string | null
  flags_enc: string | null
  source_url_enc: string | null
  compliance_score?: number | null
  flag_count?: number
  high_risk_count?: number
  medium_risk_count?: number
  low_risk_count?: number
  scan_duration_ms?: number | null
  created_at?: string
}

export interface ScanUpdate {
  original_text_enc?: string | null
  rewritten_text_enc?: string | null
  flags_enc?: string | null
  source_url_enc?: string | null
  content_type?: string
  compliance_score?: number | null
  flag_count?: number
  high_risk_count?: number
  medium_risk_count?: number
  low_risk_count?: number
  scan_duration_ms?: number | null
}

// --- Pure transforms -------------------------------------------------------

export function decryptScanRow(profileId: string, row: ScanEncryptedRow): Scan {
  const originalText = row.original_text_enc
    ? decryptForUser({
        userId: profileId,
        envelope: row.original_text_enc,
        table: TABLE,
        column: "original_text",
        rowId: row.id,
      })
    : ""

  const rewrittenText = row.rewritten_text_enc
    ? decryptForUser({
        userId: profileId,
        envelope: row.rewritten_text_enc,
        table: TABLE,
        column: "rewritten_text",
        rowId: row.id,
      })
    : null

  const flags = row.flags_enc
    ? decryptJSONForUser<ScanFlag[]>({
        userId: profileId,
        envelope: row.flags_enc,
        table: TABLE,
        column: "flags",
        rowId: row.id,
      })
    : []

  const sourceUrl = row.source_url_enc
    ? decryptForUser({
        userId: profileId,
        envelope: row.source_url_enc,
        table: TABLE,
        column: "source_url",
        rowId: row.id,
      })
    : null

  return {
    id: row.id,
    profile_id: row.profile_id,
    user_id: row.user_id,
    content_type: row.content_type,
    original_text: originalText,
    rewritten_text: rewrittenText,
    flags,
    source_url: sourceUrl,
    compliance_score: row.compliance_score,
    flag_count: row.flag_count,
    high_risk_count: row.high_risk_count,
    medium_risk_count: row.medium_risk_count,
    low_risk_count: row.low_risk_count,
    scan_duration_ms: row.scan_duration_ms,
    created_at: row.created_at,
  }
}

export function encryptScanWrite(
  profileId: string,
  input: ScanWrite,
  scanId: string,
): ScanInsert {
  const originalText = input.original_text ?? ""
  const original_text_enc = encryptForUser({
    userId: profileId,
    plaintext: originalText,
    table: TABLE,
    column: "original_text",
    rowId: scanId,
  })

  const rewritten_text_enc =
    input.rewritten_text == null
      ? null
      : encryptForUser({
          userId: profileId,
          plaintext: input.rewritten_text,
          table: TABLE,
          column: "rewritten_text",
          rowId: scanId,
        })

  const flags_enc =
    input.flags == null
      ? null
      : encryptJSONForUser({
          userId: profileId,
          payload: input.flags,
          table: TABLE,
          column: "flags",
          rowId: scanId,
        })

  const source_url_enc =
    input.source_url == null
      ? null
      : encryptForUser({
          userId: profileId,
          plaintext: input.source_url,
          table: TABLE,
          column: "source_url",
          rowId: scanId,
        })

  const insert: ScanInsert = {
    id: scanId,
    profile_id: profileId,
    user_id: input.user_id ?? null,
    content_type: input.content_type,
    original_text_enc,
    rewritten_text_enc,
    flags_enc,
    source_url_enc,
    compliance_score: input.compliance_score ?? null,
    flag_count: input.flag_count ?? 0,
    high_risk_count: input.high_risk_count ?? 0,
    medium_risk_count: input.medium_risk_count ?? 0,
    low_risk_count: input.low_risk_count ?? 0,
    scan_duration_ms: input.scan_duration_ms ?? null,
  }
  if (input.created_at) insert.created_at = input.created_at
  return insert
}

export function encryptScanUpdate(
  profileId: string,
  scanId: string,
  patch: Partial<ScanWrite>,
): ScanUpdate {
  const update: ScanUpdate = {}

  if (patch.content_type !== undefined) update.content_type = patch.content_type
  if (patch.compliance_score !== undefined) update.compliance_score = patch.compliance_score
  if (patch.flag_count !== undefined) update.flag_count = patch.flag_count
  if (patch.high_risk_count !== undefined) update.high_risk_count = patch.high_risk_count
  if (patch.medium_risk_count !== undefined) update.medium_risk_count = patch.medium_risk_count
  if (patch.low_risk_count !== undefined) update.low_risk_count = patch.low_risk_count
  if (patch.scan_duration_ms !== undefined) update.scan_duration_ms = patch.scan_duration_ms

  if (patch.original_text !== undefined) {
    update.original_text_enc =
      patch.original_text == null
        ? null
        : encryptForUser({
            userId: profileId,
            plaintext: patch.original_text,
            table: TABLE,
            column: "original_text",
            rowId: scanId,
          })
  }
  if (patch.rewritten_text !== undefined) {
    update.rewritten_text_enc =
      patch.rewritten_text == null
        ? null
        : encryptForUser({
            userId: profileId,
            plaintext: patch.rewritten_text,
            table: TABLE,
            column: "rewritten_text",
            rowId: scanId,
          })
  }
  if (patch.flags !== undefined) {
    update.flags_enc =
      patch.flags == null
        ? null
        : encryptJSONForUser({
            userId: profileId,
            payload: patch.flags,
            table: TABLE,
            column: "flags",
            rowId: scanId,
          })
  }
  if (patch.source_url !== undefined) {
    update.source_url_enc =
      patch.source_url == null
        ? null
        : encryptForUser({
            userId: profileId,
            plaintext: patch.source_url,
            table: TABLE,
            column: "source_url",
            rowId: scanId,
          })
  }

  return update
}

// --- DB access -------------------------------------------------------------

const SELECT_COLUMNS =
  "id, profile_id, user_id, content_type, original_text_enc, rewritten_text_enc, flags_enc, source_url_enc, compliance_score, flag_count, high_risk_count, medium_risk_count, low_risk_count, scan_duration_ms, created_at"

export async function getScan(
  supabase: SupabaseClient,
  profileId: string,
  scanId: string,
): Promise<Scan | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_COLUMNS)
      .eq("id", scanId)
      .eq("profile_id", profileId)
      .maybeSingle()

    if (error) throw error
    if (!data) return null
    return decryptScanRow(profileId, data as unknown as ScanEncryptedRow)
  })
}

export async function listScans(
  supabase: SupabaseClient,
  profileId: string,
  opts: { limit?: number; offset?: number; content_type?: string } = {},
): Promise<{ scans: Scan[]; count: number }> {
  return withCryptoRequestScope(async () => {
    const limit = opts.limit ?? 20
    const offset = opts.offset ?? 0

    let query = supabase
      .from(TABLE)
      .select(SELECT_COLUMNS, { count: "exact" })
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (opts.content_type) query = query.eq("content_type", opts.content_type)

    const { data, error, count } = await query
    if (error) throw error

    const rows = (data ?? []) as unknown as ScanEncryptedRow[]
    const scans = rows.map((row) => decryptScanRow(profileId, row))
    return { scans, count: count ?? 0 }
  })
}

export async function createScan(
  supabase: SupabaseClient,
  input: ScanWrite,
): Promise<Scan> {
  return withCryptoRequestScope(async () => {
    const scanId = input.id ?? crypto.randomUUID()
    const insertRow = encryptScanWrite(input.profile_id, input, scanId)

    const { data, error } = await supabase
      .from(TABLE)
      .insert(insertRow)
      .select(SELECT_COLUMNS)
      .single()

    if (error) throw error
    return decryptScanRow(input.profile_id, data as unknown as ScanEncryptedRow)
  })
}

export async function updateScanRewrite(
  supabase: SupabaseClient,
  profileId: string,
  scanId: string,
  rewrittenText: string,
): Promise<Scan> {
  return withCryptoRequestScope(async () => {
    const update: ScanUpdate = {
      rewritten_text_enc: encryptForUser({
        userId: profileId,
        plaintext: rewrittenText,
        table: TABLE,
        column: "rewritten_text",
        rowId: scanId,
      }),
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(update)
      .eq("id", scanId)
      .eq("profile_id", profileId)
      .select(SELECT_COLUMNS)
      .single()

    if (error) throw error
    return decryptScanRow(profileId, data as unknown as ScanEncryptedRow)
  })
}

/**
 * Admin read path: fetch a scan by id without an explicit profile_id filter.
 * Decryption still requires the row's profile_id (used as the per-user DEK
 * tenant), so we read it from the row itself.
 */
export async function getScanForAdmin(
  supabase: SupabaseClient,
  scanId: string,
): Promise<Scan | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_COLUMNS)
      .eq("id", scanId)
      .maybeSingle()

    if (error) throw error
    if (!data) return null
    const row = data as unknown as ScanEncryptedRow
    return decryptScanRow(row.profile_id, row)
  })
}
