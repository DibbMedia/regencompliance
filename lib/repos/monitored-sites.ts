// Repository for the `monitored_sites` table.
//
// Tenant key: `profile_id` (per-user DEK; userId = profile_id).
// AAD: `monitored_sites:{column}:{row.id}`.
//
// Encrypted columns (Phase 3 / migration 035):
//   - `domain` -> `domain_enc TEXT`
//   - `name`   -> `name_enc TEXT`
//
// Pass-through: id, profile_id, is_active, crawl_frequency, last_crawl_at,
//   next_crawl_at, total_pages, avg_compliance_score, created_at, updated_at.
import type { SupabaseClient } from "@supabase/supabase-js"
import { decryptForUser, encryptForUser, withCryptoRequestScope } from "@/lib/crypto"

const TABLE = "monitored_sites"

export interface MonitoredSite {
  id: string
  profile_id: string
  domain: string
  name: string | null
  is_active: boolean
  crawl_frequency: string | null
  last_crawl_at: string | null
  next_crawl_at: string | null
  total_pages: number
  avg_compliance_score: number | null
  created_at: string
  updated_at: string
}

export interface MonitoredSiteWrite {
  id?: string
  profile_id: string
  domain: string
  name?: string | null
  is_active?: boolean
  crawl_frequency?: string | null
  last_crawl_at?: string | null
  next_crawl_at?: string | null
  total_pages?: number
  avg_compliance_score?: number | null
  created_at?: string
  updated_at?: string
}

export interface MonitoredSiteEncryptedRow {
  id: string
  profile_id: string
  domain_enc: string | null
  name_enc: string | null
  // Legacy plaintext columns (dropped in migration 036). Dual-write transition.
  domain?: string | null
  name?: string | null
  is_active: boolean
  crawl_frequency: string | null
  last_crawl_at: string | null
  next_crawl_at: string | null
  total_pages: number
  avg_compliance_score: number | null
  created_at: string
  updated_at: string
}

export interface MonitoredSiteInsert {
  id?: string
  profile_id: string
  domain_enc: string | null
  name_enc: string | null
  is_active?: boolean
  crawl_frequency?: string | null
  last_crawl_at?: string | null
  next_crawl_at?: string | null
  total_pages?: number
  avg_compliance_score?: number | null
  created_at?: string
  updated_at?: string
}

export interface MonitoredSiteUpdate {
  domain_enc?: string | null
  name_enc?: string | null
  is_active?: boolean
  crawl_frequency?: string | null
  last_crawl_at?: string | null
  next_crawl_at?: string | null
  total_pages?: number
  avg_compliance_score?: number | null
  updated_at?: string
}

// --- Pure transforms -------------------------------------------------------

export function decryptMonitoredSiteRow(
  profileId: string,
  row: MonitoredSiteEncryptedRow,
): MonitoredSite {
  const domain =
    row.domain_enc != null
      ? decryptForUser({
          userId: profileId,
          envelope: row.domain_enc,
          table: TABLE,
          column: "domain",
          rowId: row.id,
        })
      : row.domain ?? ""

  const name =
    row.name_enc != null
      ? decryptForUser({
          userId: profileId,
          envelope: row.name_enc,
          table: TABLE,
          column: "name",
          rowId: row.id,
        })
      : row.name ?? null

  return {
    id: row.id,
    profile_id: row.profile_id,
    domain,
    name,
    is_active: row.is_active,
    crawl_frequency: row.crawl_frequency,
    last_crawl_at: row.last_crawl_at,
    next_crawl_at: row.next_crawl_at,
    total_pages: row.total_pages,
    avg_compliance_score: row.avg_compliance_score,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function encryptMonitoredSiteWrite(
  profileId: string,
  input: MonitoredSiteWrite,
  siteId: string,
): MonitoredSiteInsert {
  const domain_enc = encryptForUser({
    userId: profileId,
    plaintext: input.domain,
    table: TABLE,
    column: "domain",
    rowId: siteId,
  })

  const name_enc =
    input.name == null
      ? null
      : encryptForUser({
          userId: profileId,
          plaintext: input.name,
          table: TABLE,
          column: "name",
          rowId: siteId,
        })

  const insert: MonitoredSiteInsert = {
    id: siteId,
    profile_id: profileId,
    domain_enc,
    name_enc,
  }
  if (input.is_active !== undefined) insert.is_active = input.is_active
  if (input.crawl_frequency !== undefined) insert.crawl_frequency = input.crawl_frequency
  if (input.last_crawl_at !== undefined) insert.last_crawl_at = input.last_crawl_at
  if (input.next_crawl_at !== undefined) insert.next_crawl_at = input.next_crawl_at
  if (input.total_pages !== undefined) insert.total_pages = input.total_pages
  if (input.avg_compliance_score !== undefined)
    insert.avg_compliance_score = input.avg_compliance_score
  if (input.created_at) insert.created_at = input.created_at
  if (input.updated_at) insert.updated_at = input.updated_at
  return insert
}

export function encryptMonitoredSiteUpdate(
  profileId: string,
  siteId: string,
  patch: Partial<MonitoredSiteWrite>,
): MonitoredSiteUpdate {
  const update: MonitoredSiteUpdate = {}

  if (patch.domain !== undefined) {
    update.domain_enc =
      patch.domain == null
        ? null
        : encryptForUser({
            userId: profileId,
            plaintext: patch.domain,
            table: TABLE,
            column: "domain",
            rowId: siteId,
          })
  }
  if (patch.name !== undefined) {
    update.name_enc =
      patch.name == null
        ? null
        : encryptForUser({
            userId: profileId,
            plaintext: patch.name,
            table: TABLE,
            column: "name",
            rowId: siteId,
          })
  }
  if (patch.is_active !== undefined) update.is_active = patch.is_active
  if (patch.crawl_frequency !== undefined) update.crawl_frequency = patch.crawl_frequency
  if (patch.last_crawl_at !== undefined) update.last_crawl_at = patch.last_crawl_at
  if (patch.next_crawl_at !== undefined) update.next_crawl_at = patch.next_crawl_at
  if (patch.total_pages !== undefined) update.total_pages = patch.total_pages
  if (patch.avg_compliance_score !== undefined)
    update.avg_compliance_score = patch.avg_compliance_score
  if (patch.updated_at !== undefined) update.updated_at = patch.updated_at

  return update
}

// --- DB access -------------------------------------------------------------

// Post-cutover: migration 036 dropped the plaintext domain / name columns.
const SELECT_COLUMNS =
  "id, profile_id, domain_enc, name_enc, is_active, crawl_frequency, last_crawl_at, next_crawl_at, total_pages, avg_compliance_score, created_at, updated_at"

export async function getMonitoredSite(
  supabase: SupabaseClient,
  profileId: string,
  siteId: string,
): Promise<MonitoredSite | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_COLUMNS)
      .eq("id", siteId)
      .eq("profile_id", profileId)
      .maybeSingle()

    if (error) throw error
    if (!data) return null
    return decryptMonitoredSiteRow(profileId, data as unknown as MonitoredSiteEncryptedRow)
  })
}

export async function listMonitoredSites(
  supabase: SupabaseClient,
  profileId: string,
  opts: { limit?: number; offset?: number; activeOnly?: boolean } = {},
): Promise<{ sites: MonitoredSite[]; count: number }> {
  return withCryptoRequestScope(async () => {
    const limit = opts.limit ?? 50
    const offset = opts.offset ?? 0

    let query = supabase
      .from(TABLE)
      .select(SELECT_COLUMNS, { count: "exact" })
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (opts.activeOnly) query = query.eq("is_active", true)

    const { data, error, count } = await query
    if (error) throw error

    const rows = (data ?? []) as unknown as MonitoredSiteEncryptedRow[]
    const sites = rows.map((row) => decryptMonitoredSiteRow(profileId, row))
    return { sites, count: count ?? 0 }
  })
}

export async function createMonitoredSite(
  supabase: SupabaseClient,
  input: MonitoredSiteWrite,
): Promise<MonitoredSite> {
  return withCryptoRequestScope(async () => {
    const siteId = input.id ?? crypto.randomUUID()
    const insertRow = encryptMonitoredSiteWrite(input.profile_id, input, siteId)

    const { data, error } = await supabase
      .from(TABLE)
      .insert(insertRow)
      .select(SELECT_COLUMNS)
      .single()

    if (error) throw error
    return decryptMonitoredSiteRow(
      input.profile_id,
      data as unknown as MonitoredSiteEncryptedRow,
    )
  })
}

export async function updateMonitoredSite(
  supabase: SupabaseClient,
  profileId: string,
  siteId: string,
  patch: Partial<MonitoredSiteWrite>,
): Promise<MonitoredSite> {
  return withCryptoRequestScope(async () => {
    const update = encryptMonitoredSiteUpdate(profileId, siteId, patch)
    const { data, error } = await supabase
      .from(TABLE)
      .update(update)
      .eq("id", siteId)
      .eq("profile_id", profileId)
      .select(SELECT_COLUMNS)
      .single()

    if (error) throw error
    return decryptMonitoredSiteRow(profileId, data as unknown as MonitoredSiteEncryptedRow)
  })
}

/**
 * Cron read path: fetch the next batch of monitored sites due for a crawl.
 * Service-role context — no `profile_id` filter. Pre-encryption this was a
 * `select("*, profiles!inner(treatments)")` JOIN; the JOIN is gone because
 * `profiles.treatments` is now encrypted and only the per-user repo path
 * can read it. Cron callers fetch sites via this helper, then resolve
 * treatments per site via `getProfile(serviceClient, site.profile_id)`
 * inside the encryption request scope.
 */
export async function listMonitoredSitesForCron(
  supabase: SupabaseClient,
  opts: { limit?: number; dueBefore?: string } = {},
): Promise<MonitoredSite[]> {
  return withCryptoRequestScope(async () => {
    const limit = opts.limit ?? 10
    const dueBefore = opts.dueBefore ?? new Date().toISOString()

    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_COLUMNS)
      .eq("is_active", true)
      .lte("next_crawl_at", dueBefore)
      .order("next_crawl_at", { ascending: true })
      .limit(limit)

    if (error) throw error
    const rows = (data ?? []) as unknown as MonitoredSiteEncryptedRow[]
    return rows.map((row) => decryptMonitoredSiteRow(row.profile_id, row))
  })
}

/**
 * Admin read path: fetch a site by id without an explicit profile_id filter.
 * Decryption still requires the row's profile_id (used as the per-user DEK
 * tenant), so we read it from the row itself.
 */
export async function getMonitoredSiteForAdmin(
  supabase: SupabaseClient,
  siteId: string,
): Promise<MonitoredSite | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_COLUMNS)
      .eq("id", siteId)
      .maybeSingle()

    if (error) throw error
    if (!data) return null
    const row = data as unknown as MonitoredSiteEncryptedRow
    return decryptMonitoredSiteRow(row.profile_id, row)
  })
}
