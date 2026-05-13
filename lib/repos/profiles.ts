// Repository for `profiles`.
//
// Per the user-level encryption plan (`docs/user-level-encryption-plan.md` §3,
// §4, §12.8), `clinic_name` and `treatments[]` are encrypted under a per-user
// DEK derived from the profile row's `id` (= auth.uid). Everything else on
// the row stays plaintext: Stripe IDs (needed for webhook equality lookups),
// subscription status, booleans, timestamps, the logo URL (points at a public
// bucket — encrypting the URL while the file is publicly fetchable is theatre),
// and theme preference.
//
// AAD format for every encrypted column: `profiles:{column}:{user_id}`.
//
// All public CRUD helpers wrap their body in `withCryptoRequestScope` so that
// a single request doing N decrypts pays HKDF once per distinct user.
//
// Storage shape during the dual-write transition (Phase 2 migration 033):
//   - Plaintext columns (`clinic_name`, `treatments`) stay on the row.
//   - New ciphertext columns (`clinic_name_enc text`, `treatments_enc text`)
//     hold the canonical encrypted copies.
//
// Wave 2A behavior:
//   - WRITES go through the `_enc` columns ONLY. There is no dual-write; the
//     operator runs `scripts/backfill-profiles.ts` once after deploy and
//     applies migration 034 which drops the plaintext columns.
//   - READS prefer `_enc` and fall back to the legacy plaintext column when
//     `_enc IS NULL`. This is the transitional safety net for rows that
//     existed before deploy and haven't been backfilled yet. After migration
//     034 the plaintext columns are gone and the fallback becomes a no-op.

import type { SupabaseClient } from "@supabase/supabase-js"
import {
  decryptForUser,
  decryptJSONForUser,
  encryptForUser,
  encryptJSONForUser,
  withCryptoRequestScope,
} from "@/lib/crypto"

const TABLE = "profiles"

/** Plaintext shape returned by repo reads. Matches `Profile` in lib/types.ts
 *  plus `cancelled_at` (migration 029) and `badge_id` (migration 008). */
export interface Profile {
  id: string
  clinic_name: string | null
  treatments: string[]
  logo_url: string | null
  subscription_status: "inactive" | "active" | "past_due" | "cancelled"
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  is_beta_subscriber: boolean
  beta_enrolled_at: string | null
  cancelled_at: string | null
  onboarding_complete: boolean
  theme_preference: "light" | "dark" | "system"
  badge_id: string | null
  created_at: string
  updated_at: string
}

/** Patch shape for `updateProfile`. Every field is optional so partial
 *  updates work; `id` is supplied separately. */
export interface ProfileWrite {
  clinic_name?: string | null
  treatments?: string[]
  logo_url?: string | null
  subscription_status?: Profile["subscription_status"]
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  is_beta_subscriber?: boolean
  beta_enrolled_at?: string | null
  cancelled_at?: string | null
  onboarding_complete?: boolean
  theme_preference?: Profile["theme_preference"]
}

/** On-disk shape during the Wave 2A dual-state window. Both ciphertext and
 *  legacy plaintext columns are selectable; reads prefer ciphertext and fall
 *  back to plaintext when `_enc IS NULL` (un-backfilled rows). After migration
 *  034 the plaintext fields disappear and the fallback path is dead code. */
export interface ProfileEncryptedRow {
  id: string
  clinic_name_enc: string | null
  treatments_enc: string | null
  // Legacy plaintext fallbacks. Optional in TypeScript because migration 034
  // drops these columns; the repo treats `undefined` and `null` identically.
  clinic_name?: string | null
  treatments?: string[] | null
  logo_url: string | null
  subscription_status: Profile["subscription_status"]
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  is_beta_subscriber: boolean
  beta_enrolled_at: string | null
  cancelled_at: string | null
  onboarding_complete: boolean
  theme_preference: Profile["theme_preference"]
  badge_id: string | null
  created_at: string
  updated_at: string
}

/** Insert/update payload destined for Supabase: encrypted columns + the
 *  unchanged pass-through columns. `id` is required so AAD binding can include
 *  the row's user_id. Writes never touch the legacy plaintext columns - they
 *  go to `_enc` only, per the no-dual-write decision in §12.8. */
export interface ProfileEncryptedWrite {
  clinic_name_enc?: string | null
  treatments_enc?: string | null
  logo_url?: string | null
  subscription_status?: Profile["subscription_status"]
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  is_beta_subscriber?: boolean
  beta_enrolled_at?: string | null
  cancelled_at?: string | null
  onboarding_complete?: boolean
  theme_preference?: Profile["theme_preference"]
}

/** Decrypt a stored row into the plaintext shape. The tenant key is the
 *  row's `id` (= auth.uid). NULL ciphertext columns first try the legacy
 *  plaintext fallback (for un-backfilled rows in the Wave 2A transition
 *  window); if that's also NULL/undefined, return the type's default
 *  (NULL for clinic_name, [] for treatments). After migration 034 drops the
 *  plaintext columns, the fallback paths become unreachable. */
export function decryptProfileRow(userId: string, row: ProfileEncryptedRow): Profile {
  if (userId !== row.id) {
    // AAD would catch this, but failing fast surfaces the bug at the caller.
    throw new Error(
      `decryptProfileRow: userId ${userId} does not match row.id ${row.id}`,
    )
  }

  const clinic_name =
    row.clinic_name_enc != null
      ? decryptForUser({
          userId,
          envelope: row.clinic_name_enc,
          table: TABLE,
          column: "clinic_name",
          rowId: userId,
        })
      : (row.clinic_name ?? null) // legacy plaintext fallback (transitional)

  const treatments =
    row.treatments_enc != null
      ? decryptJSONForUser<string[]>({
          userId,
          envelope: row.treatments_enc,
          table: TABLE,
          column: "treatments",
          rowId: userId,
        })
      : (row.treatments ?? []) // legacy plaintext fallback (transitional)

  return {
    id: row.id,
    clinic_name,
    treatments,
    logo_url: row.logo_url,
    subscription_status: row.subscription_status,
    stripe_customer_id: row.stripe_customer_id,
    stripe_subscription_id: row.stripe_subscription_id,
    is_beta_subscriber: row.is_beta_subscriber,
    beta_enrolled_at: row.beta_enrolled_at,
    cancelled_at: row.cancelled_at,
    onboarding_complete: row.onboarding_complete,
    theme_preference: row.theme_preference,
    badge_id: row.badge_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

/** Transform a plaintext write into the encrypted row shape for insert/update.
 *  Only fields actually present on `input` are emitted, so partial updates
 *  don't overwrite columns the caller didn't touch. */
export function encryptProfileWrite(
  userId: string,
  input: ProfileWrite,
): ProfileEncryptedWrite {
  const out: ProfileEncryptedWrite = {}

  if ("clinic_name" in input) {
    out.clinic_name_enc =
      input.clinic_name === null || input.clinic_name === undefined
        ? null
        : encryptForUser({
            userId,
            plaintext: input.clinic_name,
            table: TABLE,
            column: "clinic_name",
            rowId: userId,
          })
  }

  if ("treatments" in input) {
    out.treatments_enc =
      input.treatments === undefined
        ? null
        : encryptJSONForUser({
            userId,
            payload: input.treatments,
            table: TABLE,
            column: "treatments",
            rowId: userId,
          })
  }

  if ("logo_url" in input) out.logo_url = input.logo_url ?? null
  if ("subscription_status" in input && input.subscription_status !== undefined) {
    out.subscription_status = input.subscription_status
  }
  if ("stripe_customer_id" in input) out.stripe_customer_id = input.stripe_customer_id ?? null
  if ("stripe_subscription_id" in input) {
    out.stripe_subscription_id = input.stripe_subscription_id ?? null
  }
  if ("is_beta_subscriber" in input && input.is_beta_subscriber !== undefined) {
    out.is_beta_subscriber = input.is_beta_subscriber
  }
  if ("beta_enrolled_at" in input) out.beta_enrolled_at = input.beta_enrolled_at ?? null
  if ("cancelled_at" in input) out.cancelled_at = input.cancelled_at ?? null
  if ("onboarding_complete" in input && input.onboarding_complete !== undefined) {
    out.onboarding_complete = input.onboarding_complete
  }
  if ("theme_preference" in input && input.theme_preference !== undefined) {
    out.theme_preference = input.theme_preference
  }

  return out
}

// --- CRUD ------------------------------------------------------------------

// Post-cutover: migration 034 dropped clinic_name + treatments. PostgREST
// returns PGRST204 on any select that names a non-existent column, so the
// plaintext fallbacks in decryptProfileRow are now dead code (kept as
// defensive null/[] returns in case a row has *_enc NULL).
const SELECT_COLUMNS =
  "id, clinic_name_enc, treatments_enc, " +
  "logo_url, subscription_status, " +
  "stripe_customer_id, stripe_subscription_id, is_beta_subscriber, " +
  "beta_enrolled_at, cancelled_at, onboarding_complete, theme_preference, " +
  "badge_id, created_at, updated_at"

export async function getProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<Profile | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_COLUMNS)
      .eq("id", userId)
      .maybeSingle()

    if (error) throw error
    if (!data) return null
    return decryptProfileRow(userId, data as unknown as ProfileEncryptedRow)
  })
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  input: ProfileWrite,
): Promise<Profile> {
  return withCryptoRequestScope(async () => {
    const patch = encryptProfileWrite(userId, input)
    const { data, error } = await supabase
      .from(TABLE)
      .update(patch)
      .eq("id", userId)
      .select(SELECT_COLUMNS)
      .single()

    if (error) throw error
    return decryptProfileRow(userId, data as unknown as ProfileEncryptedRow)
  })
}

export interface ListProfilesOptions {
  limit?: number
  offset?: number
  orderBy?: "created_at" | "updated_at"
  order?: "asc" | "desc"
}

/** Admin listing. The repo decrypts each row under its own user DEK; the
 *  request-scoped cache makes repeated derives free within a single call. */
export async function listProfilesForAdmin(
  supabase: SupabaseClient,
  opts: ListProfilesOptions = {},
): Promise<Profile[]> {
  const limit = opts.limit ?? 50
  const offset = opts.offset ?? 0
  const orderBy = opts.orderBy ?? "created_at"
  const order = opts.order ?? "desc"

  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_COLUMNS)
      .order(orderBy, { ascending: order === "asc" })
      .range(offset, offset + limit - 1)

    if (error) throw error
    const rows = (data ?? []) as unknown as ProfileEncryptedRow[]
    return rows.map((row) => decryptProfileRow(row.id, row))
  })
}

/** Public badge page (and the badge SVG endpoint) look up a profile by its
 *  random `badge_id` token, not its `id`. The repo decrypts using the row's
 *  own `id` as the tenant key once we have the row in hand. */
export async function getProfileByBadgeId(
  supabase: SupabaseClient,
  badgeId: string,
): Promise<Profile | null> {
  return withCryptoRequestScope(async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select(SELECT_COLUMNS)
      .eq("badge_id", badgeId)
      .maybeSingle()

    if (error) throw error
    if (!data) return null
    const row = data as unknown as ProfileEncryptedRow
    return decryptProfileRow(row.id, row)
  })
}
