import { z } from 'zod'

export const scanSchema = z.object({
  text: z.string().min(1, 'Content is required').max(5000, 'Content must be under 5000 characters'),
  content_type: z.enum(['website_copy', 'social_post', 'ad_copy', 'email', 'script', 'other']),
})

export const rewriteSchema = z.object({
  scan_id: z.string().uuid('Invalid scan ID'),
})

export const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const profileSchema = z.object({
  clinic_name: z.string().min(1).max(200).optional(),
  logo_url: z.string().url().optional(),
  treatments: z.array(z.string()).optional(),
  theme_preference: z.enum(['light', 'dark', 'system']).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export type ScanInput = z.infer<typeof scanSchema>
export type RewriteInput = z.infer<typeof rewriteSchema>
export type InviteInput = z.infer<typeof inviteSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type LoginInput = z.infer<typeof loginSchema>
