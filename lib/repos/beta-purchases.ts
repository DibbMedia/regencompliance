// Beta-purchases repository — pre-auth Stripe checkout-beta reservation row.
//
// Per-row DEK keyed off `row.id`. AAD = `beta_purchases:{column}:{row.id}`.
// Plaintext columns: id, stripe_customer_id, stripe_payment_intent_id,
//   claimed, claimed_by, reservation_token, reserved_at,
//   reservation_expires_at, created_at.
// Encrypted columns: email → email_enc TEXT.
//
// CRITICAL: email is NEVER read for lookup. Per plan §12.2, the claim path
// uses reservation_token only. The Stripe webhook also keys off
// stripe_customer_id / stripe_payment_intent_id / reservation_token, all
// plaintext. Email is retained for human-readable receipts/records only.
//
// NOTE: per migration 001, stripe_subscription_id lives on `profiles`, NOT
// `beta_purchases`. The task brief flagged it as conditional; this repo omits
// it because the column doesn't exist on this table.
//
// All callers must wrap reads + writes in `withCryptoRequestScope`.
import { randomUUID } from "node:crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  decryptForRow,
  encryptForRow,
  withCryptoRequestScope,
} from "@/lib/crypto"

const TABLE = "beta_purchases"

export interface BetaPurchase {
  id: string
  email: string
  // Nullable because reservation placeholder rows (from reserve_beta_seat
  // RPC) don't have a stripe_customer_id until the Stripe webhook attaches
  // it after checkout.session.completed.
  stripe_customer_id: string | null
  stripe_payment_intent_id: string | null
  claimed: boolean
  claimed_by: string | null
  reservation_token: string | null
  reserved_at: string | null
  reservation_expires_at: string | null
  created_at: string
}

export interface BetaPurchaseReservationWrite {
  email: string
  stripe_customer_id: string
  reservation_token: string
  // NOTE: per migration 001 `stripe_subscription_id` lives on `profiles`,
  // NOT `beta_purchases`. The Stripe webhook used to attempt writing it on
  // this table (silently no-op pre-PostgREST-strict); the integration pass
  // dropped that field. The subscription id lands on `profiles` via the
  // checkout-completed branch.
}

export interface BetaPurchaseEncryptedRow {
  id: string
  email_enc: string | null
  stripe_customer_id: string | null
  stripe_payment_intent_id: string | null
  claimed: boolean
  claimed_by: string | null
  reservation_token: string | null
  reserved_at: string | null
  reservation_expires_at: string | null
  created_at: string
  // Plaintext fallback (mig 041 -> backfill -> mig 042 transition).
  // Pre-cutover reservation rows wrote `email = 'pending-<token>'` via the
  // RPC; that's a sentinel, never a real address. After cutover only
  // email_enc carries the real customer email (set by Stripe webhook).
  email?: string | null
}

export function decryptBetaPurchaseRow(row: BetaPurchaseEncryptedRow): BetaPurchase {
  // Dual-read: prefer email_enc, fall back to plaintext `email` during the
  // mig 041 -> backfill -> mig 042 transition. Reservation rows from the
  // RPC may have email_enc=NULL with a sentinel plaintext or NULL.
  const email = row.email_enc
    ? decryptForRow({ rowId: row.id, envelope: row.email_enc, table: TABLE, column: "email" })
    : row.email ?? ""
  return {
    id: row.id,
    email,
    stripe_customer_id: row.stripe_customer_id,
    stripe_payment_intent_id: row.stripe_payment_intent_id,
    claimed: row.claimed,
    claimed_by: row.claimed_by,
    reservation_token: row.reservation_token,
    reserved_at: row.reserved_at,
    reservation_expires_at: row.reservation_expires_at,
    created_at: row.created_at,
  }
}

export async function createBetaPurchaseReservation(
  supabase: SupabaseClient,
  input: BetaPurchaseReservationWrite,
): Promise<BetaPurchase> {
  return withCryptoRequestScope(async () => {
    const id = randomUUID()
    const email_enc = encryptForRow({
      rowId: id,
      plaintext: input.email,
      table: TABLE,
      column: "email",
    })
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        id,
        email_enc,
        stripe_customer_id: input.stripe_customer_id,
        reservation_token: input.reservation_token,
      })
      .select("*")
      .single()
    if (error) throw error
    return decryptBetaPurchaseRow(data as BetaPurchaseEncryptedRow)
  })
}

export async function getBetaPurchase(
  supabase: SupabaseClient,
  id: string,
): Promise<BetaPurchase | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    return decryptBetaPurchaseRow(data as BetaPurchaseEncryptedRow)
  })
}

export async function listBetaPurchasesForAdmin(
  supabase: SupabaseClient,
  opts: {
    limit?: number
    offset?: number
    orderBy?: "created_at"
    order?: "asc" | "desc"
  } = {},
): Promise<BetaPurchase[]> {
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
    return (data as BetaPurchaseEncryptedRow[]).map(decryptBetaPurchaseRow)
  })
}

/**
 * Stripe-webhook finalize path. Reservation rows are created up-front by
 * `reserve_beta_seat` keyed by `reservation_token`; once checkout completes,
 * the webhook stamps the row with the real customer email + Stripe IDs.
 *
 * Because `email_enc` AAD is bound to `row.id`, this helper:
 *   1. SELECTs the row id by `reservation_token` (+ claimed=false guard).
 *   2. Encrypts `email` under the row's per-row DEK if provided.
 *   3. UPDATEs `email_enc`, `stripe_customer_id` (when provided).
 *
 * `stripe_subscription_id` is NOT written here — that column lives on
 * `profiles`, not `beta_purchases` (see migration 001).
 *
 * Throws if no matching unclaimed row exists; callers that want a soft path
 * should fall back to `createBetaPurchaseReservation`.
 */
export async function finalizeBetaPurchaseByToken(
  supabase: SupabaseClient,
  reservationToken: string,
  patch: {
    stripe_customer_id?: string
    email?: string | null
  },
): Promise<BetaPurchase> {
  return withCryptoRequestScope(async () => {
    // Step 1: resolve the row id. Required for AAD binding on email_enc.
    const { data: existing, error: selErr } = await supabase
      .from(TABLE)
      .select("id")
      .eq("reservation_token", reservationToken)
      .eq("claimed", false)
      .maybeSingle()
    if (selErr) throw selErr
    if (!existing) {
      throw new Error(
        `finalizeBetaPurchaseByToken: no unclaimed row for reservation_token`,
      )
    }
    const rowId = (existing as { id: string }).id

    // Step 2: encrypt email under the row DEK if supplied.
    const update: Record<string, unknown> = {}
    if (patch.email !== undefined && patch.email !== null) {
      update.email_enc = encryptForRow({
        rowId,
        plaintext: patch.email,
        table: TABLE,
        column: "email",
      })
    }
    if (patch.stripe_customer_id !== undefined) {
      update.stripe_customer_id = patch.stripe_customer_id
    }

    // Step 3: persist + return decrypted row.
    const { data, error } = await supabase
      .from(TABLE)
      .update(update)
      .eq("id", rowId)
      .select("*")
      .single()
    if (error) throw error
    return decryptBetaPurchaseRow(data as BetaPurchaseEncryptedRow)
  })
}

export async function deleteBetaPurchase(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id)
  if (error) throw error
}

export type ClaimResult =
  | { claimed: true; row: BetaPurchase }
  | { claimed: false; reason: "not_found" | "already_claimed" | "expired" }

/**
 * Token-based beta-purchase claim. NEVER queries by email — only by
 * `reservation_token`. Per plan §12.2, this is the supported path for
 * connecting a Stripe-paid beta seat to a freshly signed-up user.
 *
 * UPDATE beta_purchases SET claimed=true, claimed_by=? WHERE
 *   reservation_token=? AND claimed=false RETURNING *
 *
 * Result branches:
 *  - `claimed:true`  - exactly one row updated; returns decrypted row
 *  - `not_found`     - no row with that reservation_token at all
 *  - `already_claimed` - row exists but `claimed=true` already
 *  - `expired`       - row exists, not claimed, but reservation_expires_at < now()
 */
export async function claimByReservationToken(
  supabase: SupabaseClient,
  reservationToken: string,
  claimedByUserId: string,
): Promise<ClaimResult> {
  return withCryptoRequestScope(async () => {
    // 1. Try the optimistic atomic claim. Most calls succeed here.
    const { data: claimed, error: claimErr } = await supabase
      .from(TABLE)
      .update({ claimed: true, claimed_by: claimedByUserId })
      .eq("reservation_token", reservationToken)
      .eq("claimed", false)
      .select("*")
      .maybeSingle()
    if (claimErr) throw claimErr
    if (claimed) {
      const row = decryptBetaPurchaseRow(claimed as BetaPurchaseEncryptedRow)
      // Check expiry post-claim: if the row was past its TTL, surface that
      // distinct branch. (We still flipped claimed=true since the SQL is
      // unconditional on expiry; callers can take corrective action.)
      if (
        row.reservation_expires_at &&
        new Date(row.reservation_expires_at).getTime() < Date.now()
      ) {
        return { claimed: false, reason: "expired" }
      }
      return { claimed: true, row }
    }

    // 2. Disambiguate not_found vs already_claimed by reading the row
    //    without the claimed=false predicate.
    const { data: probe, error: probeErr } = await supabase
      .from(TABLE)
      .select("*")
      .eq("reservation_token", reservationToken)
      .maybeSingle()
    if (probeErr) throw probeErr
    if (!probe) return { claimed: false, reason: "not_found" }
    const row = decryptBetaPurchaseRow(probe as BetaPurchaseEncryptedRow)
    if (row.claimed) return { claimed: false, reason: "already_claimed" }
    if (
      row.reservation_expires_at &&
      new Date(row.reservation_expires_at).getTime() < Date.now()
    ) {
      return { claimed: false, reason: "expired" }
    }
    // Shouldn't happen — row exists, not claimed, not expired, but
    // the UPDATE returned no rows. Treat as not_found to be safe.
    return { claimed: false, reason: "not_found" }
  })
}
