// Repository for the `site_pages` table.
//
// Tenant key: `profile_id` (denormalized onto `site_pages` post-migration 035,
// so we don't have to JOIN through `monitored_sites` on every read).
// AAD: `site_pages:{column}:{row.id}`.
//
// Encrypted columns (Phase 3 / migration 035):
//   - `url`   -> `url_enc TEXT`
//   - `title` -> `title_enc TEXT`
//
// Pass-through: id, site_id, profile_id, compliance_score, flag_count,
//   *_risk_count, last_scan_id, last_scanned_at, status, last_error,
//   created_at, updated_at.
import type { SupabaseClient } from "@supabase/supabase-js"
import { decryptForUser, encryptForUser, withCryptoRequestScope } from "@/lib/crypto"

const TABLE = "site_pages"

export interface SitePage {
  id: string
  site_id: string
  profile_id: string
  url: string
  title: string | null
  compliance_score: number | null
  flag_count: number
  high_risk_count: number
  medium_risk_count: number
  low_risk_count: number
  last_scan_id: string | null
  last_scanned_at: string | null
  status: string | null
  last_error: string | null
  created_at: string
  updated_at: string
}

export interface SitePageWrite {
  id?: string
  site_id: string
  profile_id: string
  url: string
  title?: string | null
  compliance_score?: number | null
  flag_count?: number
  high_risk_count?: number
  medium_risk_count?: number
  low_risk_count?: number
  last_scan_id?: string | null
  last_scanned_at?: string | null
  status?: string | null
  last_error?: string | null
  created_at?: string
  updated_at?: string
}

export interface SitePageEncryptedRow {
  id: string
  site_id: string
  profile_id: string
  url_enc: string | null
  title_enc: string | null
  // Legacy plaintext columns (dropped in migration 036). Dual-write transition.
  url?: string | null
  title?: string | null
  compliance_score: number | null
  flag_count: number
  high_risk_count: number
  medium_risk_count: number
  low_risk_count: number
  last_scan_id: string | null
  last_scanned_at: string | null
  status: string | null
  last_error: string | null
  created_at: string
  updated_at: string
}

export interface SitePageInsert {
  id?: string
  site_id: string
  profile_id: string
  url_enc: string | null
  title_enc: string | null
  compliance_score?: number | null
  flag_count?: number
  high_risk_count?: number
  medium_risk_count?: number
  low_risk_count?: number
  last_scan_id?: string | null
  last_scanned_at?: string | null
  status?: string | null
  last_error?: string | null
  created_at?: string
  updated_at?: string
}

export interface SitePageUpdate {
  url_enc?: string | null
  title_enc?: string | null
  compliance_score?: number | null
  flag_count?: number
  high_risk_count?: number
  medium_risk_count?: number
  low_risk_count?: number
  last_scan_id?: string | null
  last_scanned_at?: string | null
  status?: string | null
  last_error?: string | null
  updated_at?: string
}

// --- Pure transforms -------------------------------------------------------

export function decryptSitePageRow(profileId: string, row: SitePageEncryptedRow): SitePage {
  const url =
    row.url_enc != null
      ? decryptForUser({
          userId: profileId,
          envelope: row.url_enc,
          table: TABLE,
          column: "url",
          rowId: row.id,
        })
      : row.url ?? ""

  const title =
    row.title_enc != null
      ? decryptForUser({
          userId: profileId,
          envelope: row.title_enc,
          table: TABLE,
          column: "title",
          rowId: row.id,
        })
      : row.title ?? null

  return {
    id: row.id,
    site_id: row.site_id,
    profile_id: row.profile_id,
    url,
    title,
    compliance_score: row.compliance_score,
    flag_count: row.flag_count,
    high_risk_count: row.high_risk_count,
    medium_risk_count: row.medium_risk_count,
    low_risk_count: row.low_risk_count,
    last_scan_id: row.last_scan_id,
    last_scanned_at: row.last_scanned_at,
    status: row.status,
    last_error: row.last_error ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function encryptSitePageWrite(
  profileId: string,
  input: SitePageWrite,
  pageId: string,
): SitePageInsert {
  const url_enc = encryptForUser({
    userId: profileId,
    plaintext: input.url,
    table: TABLE,
    column: "url",
    rowId: pageId,
  })

  const title_enc =
    input.title == null
      ? null
      : encryptForUser({
          userId: profileId,
          plaintext: input.title,
          table: TABLE,
          column: "title",
          rowId: pageId,
        })

  const insert: SitePageInsert = {
    id: pageId,
    site_id: input.site_id,
    profile_id: profileId,
    url_enc,
    title_enc,
  }
  if (input.compliance_score !== undefined) insert.compliance_score = input.compliance_score
  if (input.flag_count !== undefined) insert.flag_count = input.flag_count
  if (input.high_risk_count !== undefined) insert.high_risk_count = input.high_risk_count
  if (input.medium_risk_count !== undefined) insert.medium_risk_count = input.medium_risk_count
  if (input.low_risk_count !== undefined) insert.low_risk_count = input.low_risk_count
  if (input.last_scan_id !== undefined) insert.last_scan_id = input.last_scan_id
  if (input.last_scanned_at !== undefined) insert.last_scanned_at = input.last_scanned_at
  if (input.status !== undefined) insert.status = input.status
  if (input.last_error !== undefined) insert.last_error = input.last_error
  if (input.created_at) insert.created_at = input.created_at
  if (input.updated_at) insert.updated_at = input.updated_at
  return insert
}

export function encryptSitePageUpdate(
  profileId: string,
  pageId: string,
  patch: Partial<SitePageWrite>,
): SitePageUpdate {
  const update: SitePageUpdate = {}

  if (patch.url !== undefined) {
    update.url_enc =
      patch.url == null
        ? null
        : encryptForUser({
            userId: profileId,
            plaintext: patch.url,
            table: TABLE,
            column: "url",
            rowId: pageId,
          })
  }
  if (patch.title !== undefined) {
    update.title_enc =
      patch.title == null
        ? null
        : encryptForUser({
            userId: profileId,
            plaintext: patch.title,
            table: TABLE,
            column: "title",
            rowId: pageId,
          })
  }
  if (patch.compliance_score !== undefined) update.compliance_score = patch.compliance_score
  if (patch.flag_count !== undefined) update.flag_count = patch.flag_count
  if (patch.high_risk_count !== undefined) update.high_risk_count = patch.high_risk_count
  if (patch.medium_risk_count !== undefined) update.medium_risk_count = patch.medium_risk_count
  if (patch.low_risk_count !== undefined) update.low_risk_count = patch.low_risk_count
  if (patch.last_scan_id !== undefined) update.last_scan_id = patch.last_scan_id
  if (patch.last_scanned_at !== undefined) update.last_scanned_at = patch.last_scanned_at
  if (patch.status !== undefined) update.status = patch.status
  if (patch.last_error !== undefined) update.last_error = patch.last_error
  if (patch.updated_at !== undefined) update.updated_at = patch.updated_at

  return update
}

// --- DB access -------------------------------------------------------------

// Post-cutover: migration 036 dropped the plaintext url / title columns.
const SELECT_COLUMNS =
  "id, site_id, profile_id, url_enc, title_enc, compliance_score, flag_count, high_risk_count, medium_risk_count, low_risk_count, last_scan_id, last_scanned_at, status, last_error, created_at, updated_at"

export async function getSitePage(
  supabase: SupabaseClient,
  profileId: string,
  pageId: string,
): Promise<SitePage | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_COLUMNS)
      .eq("id", pageId)
      .eq("profile_id", profileId)
      .maybeSingle()

    if (error) throw error
    if (!data) return null
    return decryptSitePageRow(profileId, data as unknown as SitePageEncryptedRow)
  })
}

export async function listPagesForSite(
  supabase: SupabaseClient,
  profileId: string,
  siteId: string,
  opts: { limit?: number; offset?: number; status?: string } = {},
): Promise<{ pages: SitePage[]; count: number }> {
  return withCryptoRequestScope(async () => {
    const limit = opts.limit ?? 100
    const offset = opts.offset ?? 0

    let query = supabase
      .from(TABLE)
      .select(SELECT_COLUMNS, { count: "exact" })
      .eq("profile_id", profileId)
      .eq("site_id", siteId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (opts.status) query = query.eq("status", opts.status)

    const { data, error, count } = await query
    if (error) throw error

    const rows = (data ?? []) as unknown as SitePageEncryptedRow[]
    const pages = rows.map((row) => decryptSitePageRow(profileId, row))
    return { pages, count: count ?? 0 }
  })
}

export async function createSitePage(
  supabase: SupabaseClient,
  input: SitePageWrite,
): Promise<SitePage> {
  return withCryptoRequestScope(async () => {
    const pageId = input.id ?? crypto.randomUUID()
    const insertRow = encryptSitePageWrite(input.profile_id, input, pageId)

    const { data, error } = await supabase
      .from(TABLE)
      .insert(insertRow)
      .select(SELECT_COLUMNS)
      .single()

    if (error) throw error
    return decryptSitePageRow(input.profile_id, data as unknown as SitePageEncryptedRow)
  })
}

export async function updateSitePage(
  supabase: SupabaseClient,
  profileId: string,
  pageId: string,
  patch: Partial<SitePageWrite>,
): Promise<SitePage> {
  return withCryptoRequestScope(async () => {
    const update = encryptSitePageUpdate(profileId, pageId, patch)
    const { data, error } = await supabase
      .from(TABLE)
      .update(update)
      .eq("id", pageId)
      .eq("profile_id", profileId)
      .select(SELECT_COLUMNS)
      .single()

    if (error) throw error
    return decryptSitePageRow(profileId, data as unknown as SitePageEncryptedRow)
  })
}

/**
 * Service-role variant: list every page for a site without an explicit
 * profile_id filter (used by the shared crawler in lib/scan/run-site-crawl.ts
 * which already verified site ownership upstream). Decryption uses each
 * row's denormalized `profile_id`.
 */
export async function listPagesForSiteAsService(
  supabase: SupabaseClient,
  siteId: string,
  opts: { orderBy?: "last_scanned_at" | "compliance_score"; ascending?: boolean; nullsFirst?: boolean } = {},
): Promise<SitePage[]> {
  return withCryptoRequestScope(async () => {
    const orderBy = opts.orderBy ?? "last_scanned_at"
    const ascending = opts.ascending ?? true
    const nullsFirst = opts.nullsFirst ?? true

    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_COLUMNS)
      .eq("site_id", siteId)
      .order(orderBy, { ascending, nullsFirst })

    if (error) throw error
    const rows = (data ?? []) as unknown as SitePageEncryptedRow[]
    return rows.map((row) => decryptSitePageRow(row.profile_id, row))
  })
}

/**
 * Admin read path: fetch a page by id without an explicit profile_id filter.
 * Decryption uses the row's denormalized profile_id.
 */
export async function getSitePageForAdmin(
  supabase: SupabaseClient,
  pageId: string,
): Promise<SitePage | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_COLUMNS)
      .eq("id", pageId)
      .maybeSingle()

    if (error) throw error
    if (!data) return null
    const row = data as unknown as SitePageEncryptedRow
    return decryptSitePageRow(row.profile_id, row)
  })
}
