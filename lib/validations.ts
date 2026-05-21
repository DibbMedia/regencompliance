import { z } from 'zod'

export const scanSchema = z.object({
  text: z.string().min(1, 'Content is required').max(10000, 'Content must be under 10,000 characters'),
  content_type: z.enum(['website_copy', 'social_post', 'ad_copy', 'email', 'script', 'other']),
})

export const rewriteSchema = z.object({
  scan_id: z.string().uuid('Invalid scan ID'),
  phrase: z.string().max(500, 'Phrase must be under 500 characters').optional(),
})

export const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const waitlistSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address').max(200),
  // Honeypot: invisible field rendered offscreen + aria-hidden + tabIndex=-1.
  // Real users never fill it; bots that crawl form fields do. Route handlers
  // check for a non-empty value and silently drop the submission (200 with
  // success shape) so the bot gets no signal it tripped a check. Field is
  // optional here so legitimate submissions with empty/absent value pass
  // schema validation. The honeypot gate runs BEFORE schema parse.
  website_url2: z.string().optional(),
})

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address').max(200),
  source: z.string().trim().max(40).optional(),
  sourceSlug: z.string().trim().max(200).optional(),
})

export const SPECIALTY_OPTIONS = [
  'regen_medicine',
  'med_spa',
  'weight_loss',
  'dental',
  'dermatology',
  'aesthetic_plastic',
  'iv_therapy',
  'hormone_bhrt',
  'chiropractic',
  'wellness',
  'other',
] as const

export const ROLE_OPTIONS = [
  'owner',
  'practice_manager',
  'marketing_lead',
  'content_writer',
  'agency_partner',
  'compliance_officer',
  'other',
] as const

export const VOLUME_OPTIONS = ['0-5', '6-15', '16-50', '50+'] as const

export const freeAuditSchema = z.object({
  website_url: z.string().trim().min(1, 'Website URL is required').max(2048).url('Please enter a valid URL'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address').max(200),
  name: z.string().trim().max(100).optional().or(z.literal('')),
  clinic_name: z.string().trim().max(200).optional().or(z.literal('')),
  accept_terms: z.literal(true, { error: 'Please agree to the terms before continuing' }),
  // Honeypot - see waitlistSchema for the contract. Optional so legitimate
  // (empty) submissions pass; routes drop non-empty values silently before
  // schema parse runs.
  website_url2: z.string().optional(),
})

export const CONTACT_SUBJECT_OPTIONS = [
  'general',
  'sales',
  'support',
  'beta',
  'press',
] as const

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address').max(200),
  company: z.string().trim().max(200, 'Must be under 200 characters').optional().or(z.literal('')),
  subject: z.enum(CONTACT_SUBJECT_OPTIONS).optional(),
  message: z.string().trim().min(1, 'Message is required').max(2000, 'Message must be under 2,000 characters'),
  accept_terms: z.literal(true, { message: 'Please confirm you understand how we use your submission' }),
})

export const betaApplicationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address').max(200),
  clinic_name: z.string().trim().min(1, 'Clinic or practice name is required').max(200, 'Must be under 200 characters'),
  specialty: z.enum(SPECIALTY_OPTIONS),
  role: z.enum(ROLE_OPTIONS),
  website: z.string().trim().max(2048).url('Please enter a valid URL').optional().or(z.literal('')),
  monthly_volume: z.enum(VOLUME_OPTIONS),
  why_apply: z.string().trim().min(50, 'Tell us a bit more (at least 50 characters)').max(1000, 'Must be under 1,000 characters'),
  // Zod v4 dropped `errorMap` from the simple-overload params for z.literal -
  // the supported keys are { error?, message? }. Use `message` directly.
  accept_terms: z.literal(true, { message: 'Please confirm you agree to the founder-beta terms' }),
  // Honeypot - see waitlistSchema for the contract. Routes drop non-empty
  // values silently before schema parse runs.
  website_url2: z.string().optional(),
})

/** Block private/internal IPs in a URL string */
function isPrivateUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr)
    const h = parsed.hostname.toLowerCase()
    if (
      h === "localhost" ||
      h === "[::1]" ||
      h === "::1" ||
      /^127\./.test(h) ||
      /^10\./.test(h) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
      /^192\.168\./.test(h) ||
      /^169\.254\./.test(h) ||
      /^0\./.test(h) ||
      (h.startsWith("fc") && h.includes(":")) ||
      (h.startsWith("fd") && h.includes(":"))
    ) {
      return true
    }
    return false
  } catch {
    return true
  }
}

export const profileSchema = z.object({
  clinic_name: z.string().min(1).max(200).optional(),
  logo_url: z.string().url().max(2048, 'Logo URL must be under 2048 characters').refine(
    (url) => /^https?:\/\//i.test(url),
    { message: "Logo URL must use http or https protocol" }
  ).refine(
    (url) => !isPrivateUrl(url),
    { message: "Logo URL must not point to a private or internal network" }
  ).optional(),
  treatments: z.array(z.string().trim().min(1).max(100)).max(20, 'Maximum 20 treatments allowed').optional(),
  theme_preference: z.enum(['light', 'dark', 'system']).optional(),
  // Onboarding flow finalizer. Allowed via this route so the onboarding pages
  // don't need a dedicated endpoint; user toggling this back-and-forth is
  // harmless (only effect is the auth callback redirect target).
  onboarding_complete: z.boolean().optional(),
})

export const ticketCreateSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be under 200 characters'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional().default('normal'),
  message: z.string().min(1, 'Message is required').max(5000, 'Message must be under 5,000 characters'),
})

export const ticketMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(5000, 'Message must be under 5,000 characters'),
})

export const adminSearchSchema = z.object({
  search: z.string().max(100, 'Search must be under 100 characters').regex(/^[a-zA-Z0-9@.\-_ ]*$/, 'Search contains invalid characters').optional().default(''),
  page: z.coerce.number().int().positive().max(1000).optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.string().max(50).optional().default(''),
  category: z.string().max(50).optional().default(''),
})

export const adminRulePatchSchema = z.object({
  id: z.string().uuid('Invalid rule ID'),
  is_active: z.boolean(),
})

export const libraryQuerySchema = z.object({
  risk_level: z.enum(['high', 'medium', 'low']).optional(),
  category: z.enum(['health_claims', 'fda_approval', 'efficacy', 'safety']).optional(),
  treatment: z.enum([
    'stem_cell',
    'prp',
    'exosomes',
    'bmac',
    'whartons_jelly',
    'prolotherapy',
    'peptide',
    'iv_therapy',
    'hormone_therapy',
    'bhrt',
    'hbot',
    'svf_adipose',
  ]).optional(),
  source_type: z.enum([
    'fda_warning',
    'fda_483',
    'fda_cber',
    'ftc_press',
    'ftc_guidance',
    'doj_fraud',
    'manual',
  ]).optional(),
  // PostgREST OR uses comma/paren as delimiters - exclude them from accepted search.
  search: z.string().max(100).regex(/^[a-zA-Z0-9 .'\-_/]*$/, 'Search contains invalid characters').optional(),
})

export type LibraryQueryInput = z.infer<typeof libraryQuerySchema>

export const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Must contain at least one special character')

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id)
}

export type ScanInput = z.infer<typeof scanSchema>
export type RewriteInput = z.infer<typeof rewriteSchema>
export type InviteInput = z.infer<typeof inviteSchema>
export type WaitlistInput = z.infer<typeof waitlistSchema>
export type NewsletterInput = z.infer<typeof newsletterSchema>
export type BetaApplicationInput = z.infer<typeof betaApplicationSchema>
export type ContactFormInput = z.infer<typeof contactFormSchema>
export type FreeAuditInput = z.infer<typeof freeAuditSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type TicketCreateInput = z.infer<typeof ticketCreateSchema>
export type TicketMessageInput = z.infer<typeof ticketMessageSchema>
export type AdminSearchInput = z.infer<typeof adminSearchSchema>
export type AdminRulePatchInput = z.infer<typeof adminRulePatchSchema>
export function parsePagination(searchParams: URLSearchParams): { page: number; limit: number } {
  const rawPage = parseInt(searchParams.get("page") || "1")
  const rawLimit = parseInt(searchParams.get("limit") || "20")
  const page = Math.max(1, Math.min(Number.isNaN(rawPage) ? 1 : rawPage, 1000))
  const limit = Math.max(1, Math.min(Number.isNaN(rawLimit) ? 20 : rawLimit, 100))
  return { page, limit }
}

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
