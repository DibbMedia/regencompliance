export interface Profile {
  id: string
  clinic_name: string | null
  logo_url: string | null
  treatments: string[]
  subscription_status: 'inactive' | 'active' | 'past_due' | 'cancelled'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  is_beta_subscriber: boolean
  beta_enrolled_at: string | null
  onboarding_complete: boolean
  theme_preference: 'light' | 'dark' | 'system'
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  profile_id: string
  user_id: string | null
  email: string
  role: 'owner' | 'member'
  invite_token: string | null
  accepted: boolean
  accepted_at: string | null
  invited_at: string
}

export interface ComplianceRule {
  id: string
  banned_phrase: string
  banned_phrase_variants: string[]
  compliant_alternative: string
  risk_level: 'high' | 'medium' | 'low'
  applies_to: string[]
  category: string
  source_url: string | null
  source_name: string | null
  source_date: string | null
  enforcement_action_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type EnforcementAgency = 'FDA' | 'FTC' | 'DOJ' | null

export type EnforcementSourceType =
  | 'fda_warning'
  | 'fda_483'
  | 'fda_cber'
  | 'ftc_press'
  | 'ftc_guidance'
  | 'doj_fraud'
  | 'manual'

export interface EnforcementAction {
  id: string
  source_url: string
  source_type: EnforcementSourceType
  source_name: string
  source_date: string | null
  agency: EnforcementAgency
  company_name: string | null
  product_or_treatment: string | null
  summary: string | null
  violation_categories: string[]
  rule_count: number
  slug: string | null
  is_published: boolean
  social_post_status: 'pending' | 'posted' | 'skipped'
  created_at: string
  updated_at: string
}

export interface EnforcementActionWithRules extends EnforcementAction {
  compliance_rules: ComplianceRule[]
}

export interface ScanFlag {
  rule_id: string
  matched_text: string
  banned_phrase: string
  risk_level: 'high' | 'medium' | 'low'
  reason: string
  alternative: string
  context?: string
  element_type?: string
}

export interface Scan {
  id: string
  profile_id: string
  user_id: string | null
  content_type: string
  original_text: string
  flags: ScanFlag[]
  rewritten_text: string | null
  compliance_score: number | null
  flag_count: number
  high_risk_count: number
  medium_risk_count: number
  low_risk_count: number
  scan_duration_ms: number | null
  created_at: string
}

export interface Notification {
  id: string
  profile_id: string | null
  title: string
  body: string
  type: 'system' | 'rule_update' | 'enforcement' | 'billing'
  action_url: string | null
  read: boolean
  created_at: string
}
