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

export const profileSchema = z.object({
  clinic_name: z.string().min(1).max(200).optional(),
  logo_url: z.string().url().refine(
    (url) => /^https?:\/\//i.test(url),
    { message: "Logo URL must use http or https protocol" }
  ).optional(),
  treatments: z.array(z.string().max(100)).max(20, 'Maximum 20 treatments allowed').optional(),
  theme_preference: z.enum(['light', 'dark', 'system']).optional(),
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
