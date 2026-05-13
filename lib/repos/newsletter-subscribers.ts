// Newsletter-subscribers repository — pre-auth blog email capture.
//
// Per-row DEK keyed off `row.id`. AAD = `newsletter_subscribers:{column}:{row.id}`.
// Plaintext columns: id, source, source_slug, created_at.
// Encrypted columns (all → *_enc TEXT): email, ip_address, user_agent.
//
// `confirmed_at` and `unsubscribed_at` from migration 023 are not in the
// API contract requested for this wave - both are TIMESTAMPTZ aggregates and
// stay plaintext when/if used.
//
// All callers must wrap reads + writes in `withCryptoRequestScope`.
import { randomUUID } from "node:crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  decryptForRow,
  encryptForRow,
  withCryptoRequestScope,
} from "@/lib/crypto"

const TABLE = "newsletter_subscribers"

export interface NewsletterSubscriber {
  id: string
  email: string
  ip_address: string | null
  user_agent: string | null
  source: string | null
  source_slug: string | null
  created_at: string
}

export interface NewsletterSubscriberWrite {
  email: string
  ip_address?: string | null
  user_agent?: string | null
  source?: string | null
  source_slug?: string | null
}

export interface NewsletterSubscriberEncryptedRow {
  id: string
  email_enc: string | null
  ip_address_enc: string | null
  user_agent_enc: string | null
  source: string | null
  source_slug: string | null
  created_at: string
  // Plaintext fallbacks (mig 041 -> backfill -> mig 042 transition).
  email?: string | null
  ip_address?: string | null
  user_agent?: string | null
}

export interface NewsletterSubscriberInsertShape {
  id: string
  email_enc: string
  ip_address_enc: string | null
  user_agent_enc: string | null
  source: string | null
  source_slug: string | null
}

function encOpt(rowId: string, column: string, value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null
  return encryptForRow({ rowId, plaintext: value, table: TABLE, column })
}

function decOpt(rowId: string, column: string, envelope: string | null | undefined): string | null {
  if (envelope === null || envelope === undefined) return null
  return decryptForRow({ rowId, envelope, table: TABLE, column })
}

export function decryptNewsletterSubscriberRow(
  row: NewsletterSubscriberEncryptedRow,
): NewsletterSubscriber {
  // Dual-read: prefer *_enc, fall back to plaintext during the
  // mig 041 -> backfill -> mig 042 transition.
  return {
    id: row.id,
    email: row.email_enc
      ? decryptForRow({ rowId: row.id, envelope: row.email_enc, table: TABLE, column: "email" })
      : row.email ?? "",
    ip_address: row.ip_address_enc
      ? decOpt(row.id, "ip_address", row.ip_address_enc)
      : row.ip_address ?? null,
    user_agent: row.user_agent_enc
      ? decOpt(row.id, "user_agent", row.user_agent_enc)
      : row.user_agent ?? null,
    source: row.source,
    source_slug: row.source_slug,
    created_at: row.created_at,
  }
}

export function encryptNewsletterSubscriberWrite(
  input: NewsletterSubscriberWrite,
  rowId: string,
): NewsletterSubscriberInsertShape {
  return {
    id: rowId,
    email_enc: encryptForRow({
      rowId,
      plaintext: input.email,
      table: TABLE,
      column: "email",
    }),
    ip_address_enc: encOpt(rowId, "ip_address", input.ip_address ?? null),
    user_agent_enc: encOpt(rowId, "user_agent", input.user_agent ?? null),
    source: input.source ?? null,
    source_slug: input.source_slug ?? null,
  }
}

export async function createNewsletterSubscriber(
  supabase: SupabaseClient,
  input: NewsletterSubscriberWrite,
): Promise<NewsletterSubscriber> {
  return withCryptoRequestScope(async () => {
    const id = randomUUID()
    const payload = encryptNewsletterSubscriberWrite(input, id)
    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select("*")
      .single()
    if (error) throw error
    return decryptNewsletterSubscriberRow(data as NewsletterSubscriberEncryptedRow)
  })
}

export async function getNewsletterSubscriber(
  supabase: SupabaseClient,
  id: string,
): Promise<NewsletterSubscriber | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    return decryptNewsletterSubscriberRow(data as NewsletterSubscriberEncryptedRow)
  })
}

export async function listNewsletterSubscribersForAdmin(
  supabase: SupabaseClient,
  opts: {
    limit?: number
    offset?: number
    orderBy?: "created_at"
    order?: "asc" | "desc"
  } = {},
): Promise<NewsletterSubscriber[]> {
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
    return (data as NewsletterSubscriberEncryptedRow[]).map(decryptNewsletterSubscriberRow)
  })
}

export async function deleteNewsletterSubscriber(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id)
  if (error) throw error
}
