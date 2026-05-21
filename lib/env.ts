import { z } from 'zod'

// Vercel env vars can arrive with trailing whitespace (verified incident
// 2026-04-22: Stripe key rejection). Every string field below uses Zod's
// native `.trim()` so parsing produces the clean value; validateEnv()
// writes that cleaned value back to process.env so downstream
// `process.env.X!` reads pick it up without per-site plumbing.
const envSchema = z
  .object({
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().trim().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().trim().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1),

    // Stripe — either STRIPE_SECRET_KEY or STRIPE_RESTRICTED_KEY must be set.
    // Enforced in .superRefine below so the restricted-key rotation path works.
    STRIPE_SECRET_KEY: z.string().trim().min(1).optional(),
    STRIPE_RESTRICTED_KEY: z.string().trim().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().trim().min(1),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().trim().min(1),
    STRIPE_PRICE_ID: z.string().trim().min(1),
    STRIPE_BETA_PRICE_ID: z.string().trim().min(1).optional(),

    // Anthropic
    ANTHROPIC_API_KEY: z.string().trim().min(1),

    // Cron / app. NEXT_PUBLIC_APP_URL is the app subdomain (app.regencompliance.ai
    // post-cutover). NEXT_PUBLIC_MARKETING_URL is the marketing apex; optional
    // because lib/site-url.ts falls back to the production apex constant.
    CRON_SECRET: z.string().trim().min(1),
    NEXT_PUBLIC_APP_URL: z.string().trim().url(),
    NEXT_PUBLIC_MARKETING_URL: z.string().trim().url().optional(),
    NEXT_PUBLIC_APP_NAME: z.string().trim().min(1),
    NEXT_PUBLIC_LAUNCHED: z.enum(['true', 'false']).default('false'),
    // Server-only promo code for launch-announcement emails.
    EARLY_ACCESS_CODE: z.string().trim().optional(),

    // Email (Resend) — optional; sendEmail() no-ops when unset
    RESEND_API_KEY: z.string().trim().min(1).optional(),
    FROM_EMAIL: z.string().trim().min(1).optional(),

    // Admin shortcut — optional; platform_admins table is the canonical source
    ADMIN_EMAIL: z.string().trim().email().optional(),

    // Sentry — optional; wrapper is a no-op when DSN unset
    NEXT_PUBLIC_SENTRY_DSN: z.string().trim().url().optional(),
    SENTRY_ORG: z.string().trim().optional(),
    SENTRY_PROJECT: z.string().trim().optional(),

    // AI spend kill-switch cap (cents). Opt-in; disabled when unset or <=0.
    AI_SPEND_DAILY_CAP_CENTS: z
      .preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.coerce.number().int().nonnegative())
      .optional(),

    // Application-layer encryption key (see lib/crypto.ts). Optional until
    // a caller needs encrypt/decrypt/hmac. Must be 64 lowercase hex chars
    // (32 bytes / 256 bits) — generate with `openssl rand -hex 32`.
    ENCRYPTION_KEY_V1: z
      .string()
      .trim()
      .regex(/^[0-9a-f]{64}$/i, 'ENCRYPTION_KEY_V1 must be 64 lowercase hex chars')
      .optional(),

    // GHL Private Integration (lib/ghl.ts). Both required for any GHL event
    // to fire. When unset, sendToGhl() no-ops with a logged warning.
    GHL_API_TOKEN: z.string().trim().min(1).optional(),
    GHL_LOCATION_ID: z.string().trim().min(1).optional(),

    // NextAuth-compatible secret. Used as fallback HMAC key for the demo
    // cookie when DEMO_COOKIE_SECRET is unset.
    NEXTAUTH_SECRET: z.string().trim().min(1).optional(),

    // Server-only HMAC key for the demo-mode anonymous cookie. Falls back to
    // NEXTAUTH_SECRET, then SUPABASE_SERVICE_ROLE_KEY (last resort).
    DEMO_COOKIE_SECRET: z.string().trim().min(1).optional(),

    // Optional IP allowlist for /admin/, /superadmin/, and /api/admin/ paths.
    // Comma-separated IPv4/IPv6 addresses and/or CIDR blocks. When unset,
    // no IP gating (default). When set, non-matching IPs receive HTTP 403.
    // Parsing + validation is delegated to lib/security/ip-allowlist.ts;
    // we keep the env-validation contract loose (`optional()` string) so a
    // typo in one entry doesn't fail the entire env-validation step at boot.
    ADMIN_ALLOWED_IPS: z.string().optional(),
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
// Server-only EARLY_ACCESS_CODE.
export const EARLY_ACCESS_CODE = process.env.EARLY_ACCESS_CODE?.trim() || ''

export type Env = z.infer<typeof envSchema>

let validated = false
let warnedMissingEncryptionKey = false

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

  // Production-only tighten: ENCRYPTION_KEY_V1 must be set. The schema
  // marks it optional (because tests and local dev don't always have it),
  // but in production a missing key means every encrypted-column read will
  // hard-error at runtime. Fail fast at boot instead.
  if (process.env.NODE_ENV === 'production' && !result.data.ENCRYPTION_KEY_V1) {
    throw new Error(
      'Invalid environment: ENCRYPTION_KEY_V1 is required in production. ' +
        'Generate with `openssl rand -hex 32` and set in Vercel as Sensitive.',
    )
  }

  // Outside production, warn once if the key is unset so devs notice before
  // their first encrypted-column read explodes.
  if (
    process.env.NODE_ENV !== 'production' &&
    !result.data.ENCRYPTION_KEY_V1 &&
    !warnedMissingEncryptionKey
  ) {
    warnedMissingEncryptionKey = true
    // eslint-disable-next-line no-console
    console.warn(
      '[env] ENCRYPTION_KEY_V1 is unset. Generate with `openssl rand -hex 32` ' +
        'and set in .env.local before exercising encrypted columns.',
    )
  }

  validated = true
}
