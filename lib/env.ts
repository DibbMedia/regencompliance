import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_PRICE_ID: z.string().min(1),
  STRIPE_PORTAL_RETURN_URL: z.string().url(),
  ANTHROPIC_API_KEY: z.string().min(1),
  CRON_SECRET: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_LAUNCHED: z.enum(['true', 'false']).default('false'),
  NEXT_PUBLIC_EARLY_ACCESS_CODE: z.string().optional(),
})

export const IS_LAUNCHED = process.env.NEXT_PUBLIC_LAUNCHED === 'true'
export const EARLY_ACCESS_CODE = process.env.NEXT_PUBLIC_EARLY_ACCESS_CODE || ''

export type Env = z.infer<typeof envSchema>

let validated = false

export function validateEnv() {
  if (validated) return
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join('.')).join(', ')
    throw new Error(`Missing or invalid environment variables: ${missing}`)
  }
  validated = true
}
