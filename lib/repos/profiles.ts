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
// This module operates on the encrypted columns only; callsite migration to
// this module is the cutover step. After migration 034 drops plaintext
// columns the on-disk shape matches `ProfileEncryptedRow` exactly.

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
 *  plus `cancelled_at` (migration 029). */
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

/** On-disk shape after migration 034 (plaintext columns dropped). The repo
 *  ALSO accepts this shape during dual-write because we read only the `_enc`
 *  variants. */
export interface ProfileEncryptedRow {
  id: string
  clinic_name_enc: string | null
  treatments_enc: string | null
  logo_url: string | null
  subscription_status: Profile["subscription_status"]
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  is_beta_subscriber: boolean
  beta_enrolled_at: string | null
  cancelled_at: string | null
  onboarding_complete: boolean
  theme_preference: Profile["theme_preference"]
  created_at: string
  updated_at: string
}

/** Insert/update payload destined for Supabase: encrypted columns + the
 *  unchanged pass-through columns. `id` is required so AAD binding can include
 *  the row's user_id. */
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
 *  row's `id` (= auth.uid). NULL ciphertext columns return NULL plaintext
 *  without a decrypt call. For `treatments_enc`, NULL decodes to `[]` so the
 *  plaintext contract (`treatments: string[]`) stays non-nullable. */
export function decryptProfileRow(userId: string, row: ProfileEncryptedRow): Profile {
  if (userId !== row.id) {
    // AAD would catch this, but failing fast surfaces the bug at the caller.
    throw new Error(
      `decryptProfileRow: userId ${userId} does not match row.id ${row.id}`,
    )
  }

  const clinic_name =
    row.clinic_name_enc === null
      ? null
      : decryptForUser({
          userId,
          envelope: row.clinic_name_enc,
          table: TABLE,
          column: "clinic_name",
          rowId: userId,
        })

  const treatments =
    row.treatments_enc === null
      ? []
      : decryptJSONForUser<string[]>({
          userId,
          envelope: row.treatments_enc,
          table: TABLE,
          column: "treatments",
          rowId: userId,
        })

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

const SELECT_COLUMNS =
  "id, clinic_name_enc, treatments_enc, logo_url, subscription_status, " +
  "stripe_customer_id, stripe_subscription_id, is_beta_subscriber, " +
  "beta_enrolled_at, cancelled_at, onboarding_complete, theme_preference, " +
  "created_at, updated_at"

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
