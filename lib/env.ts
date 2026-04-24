import { z } from 'zod'

// Vercel env vars can arrive with trailing whitespace (verified incident
// 2026-04-22: Stripe key rejection). Trim every string before validation and
// write the trimmed value back to process.env so downstream `process.env.X`
// reads pick up the clean value without per-site .trim() plumbing.
const trimmed = () =>
  z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string())

const envSchema = z
  .object({
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: trimmed().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: trimmed().min(1),
    SUPABASE_SERVICE_ROLE_KEY: trimmed().min(1),

    // Stripe — either STRIPE_SECRET_KEY or STRIPE_RESTRICTED_KEY must be set.
    // Enforced in .superRefine below so the restricted-key rotation path works.
    STRIPE_SECRET_KEY: trimmed().min(1).optional(),
    STRIPE_RESTRICTED_KEY: trimmed().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: trimmed().min(1),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: trimmed().min(1),
    STRIPE_PRICE_ID: trimmed().min(1),
    STRIPE_BETA_PRICE_ID: trimmed().min(1).optional(),

    // Anthropic
    ANTHROPIC_API_KEY: trimmed().min(1),

    // Cron / app
    CRON_SECRET: trimmed().min(1),
    NEXT_PUBLIC_APP_URL: trimmed().url(),
    NEXT_PUBLIC_APP_NAME: trimmed().min(1),
    NEXT_PUBLIC_LAUNCHED: z.enum(['true', 'false']).default('false'),
    // Server-only promo code for launch-announcement emails. Accepts both
    // EARLY_ACCESS_CODE (preferred, server-only) and the legacy
    // NEXT_PUBLIC_EARLY_ACCESS_CODE (shipped to every browser bundle — remove
    // after migrating Vercel env).
    EARLY_ACCESS_CODE: trimmed().optional(),
    NEXT_PUBLIC_EARLY_ACCESS_CODE: trimmed().optional(),

    // Email (Resend) — optional; sendEmail() no-ops when unset
    RESEND_API_KEY: trimmed().min(1).optional(),
    FROM_EMAIL: trimmed().min(1).optional(),

    // Admin shortcut — optional; platform_admins table is the canonical source
    ADMIN_EMAIL: trimmed().email().optional(),

    // Sentry — optional; wrapper is a no-op when DSN unset
    NEXT_PUBLIC_SENTRY_DSN: trimmed().url().optional(),
    SENTRY_ORG: trimmed().optional(),
    SENTRY_PROJECT: trimmed().optional(),

    // AI spend kill-switch cap (cents). Opt-in; disabled when unset or <=0.
    AI_SPEND_DAILY_CAP_CENTS: z
      .preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.coerce.number().int().nonnegative())
      .optional(),

    // Application-layer encryption key (see lib/crypto.ts). Optional until
    // a caller needs encrypt/decrypt/hmac. Must be 64 lowercase hex chars
    // (32 bytes / 256 bits) — generate with `openssl rand -hex 32`.
    ENCRYPTION_KEY_V1: z
      .preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().regex(/^[0-9a-f]{64}$/i, 'ENCRYPTION_KEY_V1 must be 64 lowercase hex chars'))
      .optional(),
  })
  .superRefine((env, ctx) => {
    if (!env.STRIPE_SECRET_KEY && !env.STRIPE_RESTRICTED_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Missing Stripe key: set STRIPE_RESTRICTED_KEY (preferred) or STRIPE_SECRET_KEY',
        path: ['STRIPE_RESTRICTED_KEY'],
      })
    }
  })

export const IS_LAUNCHED = process.env.NEXT_PUBLIC_LAUNCHED?.trim() === 'true'
// Prefer server-only EARLY_ACCESS_CODE; fall back to the legacy NEXT_PUBLIC_
// variant so the rename in Vercel isn't blocking. Remove the fallback once
// NEXT_PUBLIC_EARLY_ACCESS_CODE is deleted from every environment.
export const EARLY_ACCESS_CODE =
  process.env.EARLY_ACCESS_CODE?.trim() ||
  process.env.NEXT_PUBLIC_EARLY_ACCESS_CODE?.trim() ||
  ''

export type Env = z.infer<typeof envSchema>

let validated = false

export function validateEnv(): void {
  if (validated) return
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ')
    throw new Error(`Invalid environment: ${issues}`)
  }

  // Write trimmed values back to process.env so every downstream
  // `process.env.X` read picks up the sanitized value. Avoids a
  // repeat of the 2026-04-22 trailing-whitespace incident on Stripe.
  for (const [key, value] of Object.entries(result.data)) {
    if (typeof value === 'string' && process.env[key] !== value) {
      process.env[key] = value
    }
  }

  validated = true
}
