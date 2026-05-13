/**
 * Backfill scans, monitored_sites, site_pages encryption envelopes.
 *
 * Idempotent: skips rows where every relevant `*_enc` column is already
 * populated. Paginates 50 rows at a time. Order matters because crypto
 * is keyed by `profile_id` — sites/pages already have profile_id, but
 * site_pages.profile_id was denormalized in migration 035 so we count on
 * that backfill having already run as part of the same migration.
 *
 * Run locally with:
 *   SUPABASE_URL=... \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   ENCRYPTION_KEY_V1=... \
 *   npx tsx scripts/backfill-scans-sites.ts
 *
 * After this completes for all three tables, apply migration 036 to drop
 * the plaintext columns.
 */
import { createClient } from "@supabase/supabase-js"
import {
  encryptForUser,
  encryptJSONForUser,
  withCryptoRequestScope,
} from "../lib/crypto"
import type { ScanFlag } from "../lib/types"

const PAGE_SIZE = 50

function getEnv(name: string): string {
  const v = process.env[name]?.trim()
  if (!v) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return v
}

function makeClient() {
  const url = getEnv("SUPABASE_URL") || getEnv("NEXT_PUBLIC_SUPABASE_URL")
  const key = getEnv("SUPABASE_SERVICE_ROLE_KEY")
  return createClient(url, key, { auth: { persistSession: false } })
}

// --- scans ----------------------------------------------------------------

interface ScanBackfillRow {
  id: string
  profile_id: string
  original_text: string | null
  rewritten_text: string | null
  flags: ScanFlag[] | null
  source_url: string | null
  original_text_enc: string | null
  rewritten_text_enc: string | null
  flags_enc: string | null
  source_url_enc: string | null
}

async function backfillScans(supabase: ReturnType<typeof makeClient>): Promise<{ processed: number; skipped: number; failed: number }> {
  let processed = 0
  let skipped = 0
  let failed = 0
  let offset = 0

  for (;;) {
    const { data, error } = await supabase
      .from("scans")
      .select(
        "id, profile_id, original_text, rewritten_text, flags, source_url, original_text_enc, rewritten_text_enc, flags_enc, source_url_enc",
      )
      .order("created_at", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) throw error
    if (!data || data.length === 0) break

    for (const row of data as ScanBackfillRow[]) {
      // Skip if already fully encrypted.
      const needsOriginal = row.original_text_enc == null && row.original_text != null
      const needsRewritten = row.rewritten_text_enc == null && row.rewritten_text != null
      const needsFlags = row.flags_enc == null && row.flags != null
      const needsSource = row.source_url_enc == null && row.source_url != null
      if (!needsOriginal && !needsRewritten && !needsFlags && !needsSource) {
        skipped++
        continue
      }

      try {
        await withCryptoRequestScope(async () => {
          const update: Record<string, string> = {}
          if (needsOriginal && row.original_text != null) {
            update.original_text_enc = encryptForUser({
              userId: row.profile_id,
              plaintext: row.original_text,
              table: "scans",
              column: "original_text",
              rowId: row.id,
            })
          }
          if (needsRewritten && row.rewritten_text != null) {
            update.rewritten_text_enc = encryptForUser({
              userId: row.profile_id,
              plaintext: row.rewritten_text,
              table: "scans",
              column: "rewritten_text",
              rowId: row.id,
            })
          }
          if (needsFlags && row.flags != null) {
            update.flags_enc = encryptJSONForUser({
              userId: row.profile_id,
              payload: row.flags,
              table: "scans",
              column: "flags",
              rowId: row.id,
            })
          }
          if (needsSource && row.source_url != null) {
            update.source_url_enc = encryptForUser({
              userId: row.profile_id,
              plaintext: row.source_url,
              table: "scans",
              column: "source_url",
              rowId: row.id,
            })
          }

          const { error: updateError } = await supabase
            .from("scans")
            .update(update)
            .eq("id", row.id)
          if (updateError) throw updateError
        })
        processed++
      } catch (err) {
        console.error(`scans:${row.id} backfill failed:`, err)
        failed++
      }
    }

    if (data.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return { processed, skipped, failed }
}

// --- monitored_sites ------------------------------------------------------

interface SiteBackfillRow {
  id: string
  profile_id: string
  domain: string | null
  name: string | null
  domain_enc: string | null
  name_enc: string | null
}

async function backfillMonitoredSites(supabase: ReturnType<typeof makeClient>): Promise<{ processed: number; skipped: number; failed: number }> {
  let processed = 0
  let skipped = 0
  let failed = 0
  let offset = 0

  for (;;) {
    const { data, error } = await supabase
      .from("monitored_sites")
      .select("id, profile_id, domain, name, domain_enc, name_enc")
      .order("created_at", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) throw error
    if (!data || data.length === 0) break

    for (const row of data as SiteBackfillRow[]) {
      const needsDomain = row.domain_enc == null && row.domain != null
      const needsName = row.name_enc == null && row.name != null
      if (!needsDomain && !needsName) {
        skipped++
        continue
      }

      try {
        await withCryptoRequestScope(async () => {
          const update: Record<string, string> = {}
          if (needsDomain && row.domain != null) {
            update.domain_enc = encryptForUser({
              userId: row.profile_id,
              plaintext: row.domain,
              table: "monitored_sites",
              column: "domain",
              rowId: row.id,
            })
          }
          if (needsName && row.name != null) {
            update.name_enc = encryptForUser({
              userId: row.profile_id,
              plaintext: row.name,
              table: "monitored_sites",
              column: "name",
              rowId: row.id,
            })
          }
          const { error: updateError } = await supabase
            .from("monitored_sites")
            .update(update)
            .eq("id", row.id)
          if (updateError) throw updateError
        })
        processed++
      } catch (err) {
        console.error(`monitored_sites:${row.id} backfill failed:`, err)
        failed++
      }
    }

    if (data.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return { processed, skipped, failed }
}

// --- site_pages -----------------------------------------------------------

interface PageBackfillRow {
  id: string
  profile_id: string | null
  url: string | null
  title: string | null
  url_enc: string | null
  title_enc: string | null
}

async function backfillSitePages(supabase: ReturnType<typeof makeClient>): Promise<{ processed: number; skipped: number; failed: number }> {
  let processed = 0
  let skipped = 0
  let failed = 0
  let offset = 0

  for (;;) {
    const { data, error } = await supabase
      .from("site_pages")
      .select("id, profile_id, url, title, url_enc, title_enc")
      .order("created_at", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) throw error
    if (!data || data.length === 0) break

    for (const row of data as PageBackfillRow[]) {
      if (row.profile_id == null) {
        console.error(`site_pages:${row.id} skipped: profile_id is NULL (migration 035 backfill must complete first)`)
        failed++
        continue
      }

      const needsUrl = row.url_enc == null && row.url != null
      const needsTitle = row.title_enc == null && row.title != null
      if (!needsUrl && !needsTitle) {
        skipped++
        continue
      }

      try {
        await withCryptoRequestScope(async () => {
          const update: Record<string, string> = {}
          const profileId = row.profile_id as string
          if (needsUrl && row.url != null) {
            update.url_enc = encryptForUser({
              userId: profileId,
              plaintext: row.url,
              table: "site_pages",
              column: "url",
              rowId: row.id,
            })
          }
          if (needsTitle && row.title != null) {
            update.title_enc = encryptForUser({
              userId: profileId,
              plaintext: row.title,
              table: "site_pages",
              column: "title",
              rowId: row.id,
            })
          }
          const { error: updateError } = await supabase
            .from("site_pages")
            .update(update)
            .eq("id", row.id)
          if (updateError) throw updateError
        })
        processed++
      } catch (err) {
        console.error(`site_pages:${row.id} backfill failed:`, err)
        failed++
      }
    }

    if (data.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return { processed, skipped, failed }
}

async function main() {
  const supabase = makeClient()

  console.log("Backfilling scans...")
  const scans = await backfillScans(supabase)
  console.log(`scans: processed=${scans.processed} skipped=${scans.skipped} failed=${scans.failed}`)

  console.log("Backfilling monitored_sites...")
  const sites = await backfillMonitoredSites(supabase)
  console.log(`monitored_sites: processed=${sites.processed} skipped=${sites.skipped} failed=${sites.failed}`)

  console.log("Backfilling site_pages...")
  const pages = await backfillSitePages(supabase)
  console.log(`site_pages: processed=${pages.processed} skipped=${pages.skipped} failed=${pages.failed}`)

  const totalFailed = scans.failed + sites.failed + pages.failed
  if (totalFailed > 0) {
    console.error(`Backfill completed with ${totalFailed} failures. Inspect and re-run before applying migration 036.`)
    process.exit(1)
  }
  console.log("Backfill complete.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
