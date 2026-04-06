# RegenCompliance — Complete Application Build Specification
### For Claude Code CLI — Full A-to-Z Phased Build
### Stack: Next.js 14 (App Router) · TypeScript · Supabase · Vercel · Stripe · Anthropic Claude API · Tailwind CSS · shadcn/ui

---

## 1. Product Overview

Product Name: RegenCompliance (placeholder — rename as needed)
Price: $497/month flat, all features included
Target User: Regenerative medicine clinic owners, marketing staff, front desk
Core Purpose: Paste any marketing content (website copy, social captions, ad copy, emails, scripts) and get an instant FDA/FTC compliance score, flagged phrases with compliant rewrites, and a running audit log. Compliance rules auto-update daily via cron scraper.
Upsell Funnel: Leads into RegenPortal SEO/content retainer ($2,000–$5,000/month)
No HIPAA data ever. No patient records, no PHI, no clinical data. Text analysis tool only.

---

## 2. Full Tech Stack

Framework: Next.js 14 App Router — TypeScript, server components, API routes
Auth: Supabase Auth — Magic link only, no passwords
Database: Supabase Postgres — Row-level security on all tables
Storage: Supabase Storage — Profile logos only
Hosting: Vercel Pro — Cron jobs, edge middleware, analytics
Payments: Stripe — Recurring monthly subscriptions, customer portal
LLM Scan: Claude claude-haiku-4-5 — Fast, cheap compliance flagging
LLM Rewrite: Claude claude-sonnet-4-5 — Higher quality rewrites
Styling: Tailwind CSS v3
Component Library: shadcn/ui
Dark/Light Mode: next-themes — System default + manual toggle
Icons: Lucide React
Forms: React Hook Form + Zod
Data Fetching: SWR
Rate Limiting: Upstash Redis — Per-user API rate limits
Cron Scraper: Vercel Cron — Daily FDA/FTC enforcement scrape
HTTP Parsing: Cheerio — Server-side HTML parsing for scraper
PDF Export: @react-pdf/renderer
Toast/Alerts: shadcn/ui Sonner

---

## 3. Environment Variables

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ID=
STRIPE_PORTAL_RETURN_URL=https://yourdomain.com/dashboard/account

# Anthropic
ANTHROPIC_API_KEY=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Cron protection
CRON_SECRET=

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME=RegenCompliance

---

## 4. Application Architecture

### Route Structure

/ ............................................. Public landing page
/login ........................................ Magic link login
/auth/callback ................................ Supabase auth callback
/onboarding ................................... First-time setup (2 steps)
/onboarding/clinic ............................ Step 1: Clinic name + logo
/onboarding/treatments ........................ Step 2: Treatment selection

/dashboard .................................... Main app shell (protected)
/dashboard/scanner ............................ Core scan tool (default view)
/dashboard/history ............................ All past scans
/dashboard/history/[id] ....................... Individual scan detail view
/dashboard/library ............................ Compliance rules reference
/dashboard/notifications ...................... All notifications
/dashboard/account ............................ Billing, profile, team
/dashboard/account/team ....................... Team member management

/api/auth/callback ............................ Supabase redirect handler
/api/stripe/checkout .......................... Create checkout session
/api/stripe/webhook ........................... Stripe event handler
/api/stripe/portal ............................ Customer portal redirect
/api/scan ..................................... Run compliance scan
/api/rewrite .................................. Rewrite flagged content
/api/scans .................................... List scans (paginated)
/api/scans/[id] ............................... Get single scan
/api/scans/[id]/export ........................ Export scan as PDF
/api/library .................................. Get compliance rules
/api/notifications ............................ List notifications
/api/notifications/read ....................... Mark notifications read
/api/notifications/unread-count ............... Unread badge count
/api/team ..................................... List team members
/api/team/invite .............................. Generate invite link
/api/team/[id] ................................ Remove team member
/api/profile .................................. Update profile
/api/cron/scrape-rules ........................ Daily FDA/FTC scraper

### User Roles

owner — Clinic owner who subscribed. Full access: all features, billing, team management, can invite/remove members.
member — Invited team member. Scanner, history (shared), library, notifications. Cannot access billing or team management.

Both roles share the same profile_id (the owner's). Members are linked to the owner's account. Subscription gates both.

---

## 5. Database Schema — Phase 2 Prompt

Create a complete Supabase migration SQL file. Enable Row Level Security on all tables. Use uuid_generate_v4() for all primary keys.

--- TABLE: profiles ---
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  clinic_name text,
  logo_url text,
  treatments text[] DEFAULT '{}',
  subscription_status text DEFAULT 'inactive',
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  onboarding_complete boolean DEFAULT false,
  theme_preference text DEFAULT 'system',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

Auto-create profile on user signup:
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

--- TABLE: team_members ---
CREATE TABLE team_members (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  role text DEFAULT 'member',
  invite_token text UNIQUE,
  accepted boolean DEFAULT false,
  accepted_at timestamptz,
  invited_at timestamptz DEFAULT now()
);

--- TABLE: compliance_rules ---
CREATE TABLE compliance_rules (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  banned_phrase text NOT NULL,
  banned_phrase_variants text[] DEFAULT '{}',
  compliant_alternative text NOT NULL,
  risk_level text NOT NULL DEFAULT 'medium',
  applies_to text[] DEFAULT '{}',
  category text DEFAULT 'health_claims',
  source_url text,
  source_name text,
  source_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

--- TABLE: scans ---
CREATE TABLE scans (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content_type text NOT NULL DEFAULT 'other',
  original_text text NOT NULL,
  flags jsonb DEFAULT '[]',
  rewritten_text text,
  compliance_score integer,
  flag_count integer DEFAULT 0,
  high_risk_count integer DEFAULT 0,
  medium_risk_count integer DEFAULT 0,
  low_risk_count integer DEFAULT 0,
  scan_duration_ms integer,
  created_at timestamptz DEFAULT now()
);

--- TABLE: notifications ---
CREATE TABLE notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  type text DEFAULT 'system',
  action_url text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

--- RLS POLICIES ---
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can manage team" ON team_members FOR ALL USING (
  profile_id = auth.uid() OR user_id = auth.uid()
);

ALTER TABLE compliance_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read rules" ON compliance_rules FOR SELECT TO authenticated USING (true);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own scans" ON scans FOR SELECT USING (
  profile_id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() LIMIT 1)
  OR profile_id = auth.uid()
);
CREATE POLICY "Users can insert own scans" ON scans FOR INSERT WITH CHECK (
  profile_id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() LIMIT 1)
  OR profile_id = auth.uid()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (
  profile_id IS NULL OR profile_id = auth.uid() OR
  profile_id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() LIMIT 1)
);
CREATE POLICY "Users can mark notifications read" ON notifications FOR UPDATE USING (
  profile_id = auth.uid() OR
  profile_id = (SELECT profile_id FROM team_members WHERE user_id = auth.uid() LIMIT 1)
);

--- INDEXES ---
CREATE INDEX idx_scans_profile_id ON scans(profile_id);
CREATE INDEX idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX idx_notifications_profile_id ON notifications(profile_id);
CREATE INDEX idx_compliance_rules_active ON compliance_rules(is_active) WHERE is_active = true;

--- SEED: Insert 30 real FDA/FTC-flagged phrases for regenerative medicine ---
Include phrases like: heals, cures, treats, reverses, FDA-approved stem cells, eliminates,
repairs damage, regrows, proven to, guaranteed results, scientifically proven cure,
clinically proven cure, restores function completely, no side effects, safe for everyone,
miracle treatment, breakthrough cure, eradicates, destroys disease, permanent solution,
replaces surgery, FDA cleared therapy, regenerates organs, reverses aging completely,
treats cancer, cures Alzheimers, fixes nerve damage permanently, removes arthritis,
eliminates chronic pain forever, repairs spinal damage.
For each: provide compliant_alternative, risk_level, applies_to, source_url from actual FDA/FTC enforcement letters.

---

## 6. Phase 1 — Project Scaffold + Auth

Initialize a new Next.js 14 project with TypeScript and App Router named regen-compliance.

Install packages:
- @supabase/supabase-js @supabase/ssr
- next-themes
- tailwindcss postcss autoprefixer
- shadcn/ui (init: default style, slate base color, CSS variables enabled)
- lucide-react
- swr
- react-hook-form @hookform/resolvers zod
- sonner

Configure:
1. tailwind.config.ts — darkMode: 'class'
2. globals.css — shadcn CSS variable definitions for light and dark themes
3. shadcn components to add: button, input, card, badge, separator, skeleton, sheet, dialog,
   dropdown-menu, popover, sidebar, avatar, tooltip, scroll-area, tabs, textarea, select,
   checkbox, table, form, label, progress, accordion

File structure:
app/
  layout.tsx (ThemeProvider from next-themes, Toaster from sonner)
  page.tsx (landing page placeholder)
  login/page.tsx (magic link form)
  auth/callback/route.ts (Supabase auth exchange)
  onboarding/
    layout.tsx (no sidebar, centered)
    page.tsx (redirect to /onboarding/clinic)
    clinic/page.tsx
    treatments/page.tsx
  dashboard/
    layout.tsx (protected, sidebar + header)
    page.tsx (redirect to /dashboard/scanner)
    scanner/page.tsx
    history/page.tsx
    history/[id]/page.tsx
    library/page.tsx
    notifications/page.tsx
    account/page.tsx
    account/team/page.tsx

lib/
  supabase/client.ts (browser client)
  supabase/server.ts (server client via @supabase/ssr)
  supabase/resolve-profile.ts (effectiveProfileId utility)
  utils.ts (cn() helper)
  types.ts (all DB TypeScript types)
  validations.ts (Zod schemas)
  env.ts (env var validation)
  rate-limit.ts (Upstash Redis rate limiters)
  notifications.ts (createBroadcastNotification, createUserNotification)

components/
  layout/
    dashboard-sidebar.tsx
    dashboard-header.tsx
    theme-toggle.tsx
  ui/ (shadcn auto-generated)

middleware.ts:
- Unauthenticated → redirect to /login
- Authenticated + onboarding_complete=false → redirect to /onboarding/clinic
- Authenticated + subscription not active → allow /dashboard/account only, redirect all others

TypeScript types in lib/types.ts:
Profile, TeamMember, ComplianceRule, Scan, ScanFlag, Notification

---

## 7. Phase 3 — Dashboard Layout + Sidebar + Theme

SIDEBAR (components/layout/dashboard-sidebar.tsx):
- Use shadcn Sidebar component
- Logo: Shield icon + "RegenCompliance" text at top
- Nav items with icons:
  * Scanner — /dashboard/scanner — Shield icon
  * Scan History — /dashboard/history — Clock icon
  * Compliance Library — /dashboard/library — BookOpen icon
  * Notifications — /dashboard/notifications — Bell icon + unread count badge
  * Account & Billing — /dashboard/account — Settings icon
- Bottom: clinic name + user email + logout button
- Collapsible to icon-only on desktop
- Mobile: bottom sheet drawer via hamburger

HEADER (components/layout/dashboard-header.tsx):
- Left: dynamic page title based on current route
- Right: theme toggle, notification bell with unread badge (SWR refreshes every 60s), user avatar dropdown
- Avatar dropdown: user email, clinic name, role badge (Owner/Member), links to Account, Manage Billing, Logout

THEME:
- next-themes ThemeProvider wraps app/layout.tsx
- attribute="class" defaultTheme="system" enableSystem
- Light: white bg, slate-900 text, slate-200 borders, blue-600 primary
- Dark: slate-950 bg, slate-50 text, slate-800 borders, blue-400 primary
- Theme toggle cycles: light / dark / system
- On change: PATCH /api/profile { theme_preference }
- On dashboard load: restore theme from profile.theme_preference via useTheme()

---

## 8. Phase 4 — Stripe Subscriptions

Install: stripe @stripe/stripe-js

/api/stripe/checkout POST:
- Require auth + active session
- Get or create Stripe customer (match by stripe_customer_id in profiles)
- Save stripe_customer_id to profiles if newly created
- Create Checkout Session:
  * mode: subscription
  * price: STRIPE_PRICE_ID
  * success_url: /dashboard/scanner?subscribed=true
  * cancel_url: /dashboard/account
  * allow_promotion_codes: true
- Return { url }

/api/stripe/webhook POST:
- Verify Stripe signature (raw body)
- Handle events:
  * checkout.session.completed → status=active, save stripe_subscription_id, create billing notification
  * customer.subscription.updated → update status from Stripe status field
  * customer.subscription.deleted → status=cancelled, create notification
  * invoice.payment_failed → status=past_due, create notification
- All updates via Supabase service role

/api/stripe/portal POST:
- Require auth + active subscription
- Create Stripe Customer Portal session
- Return redirect URL

Account page billing section (owner only):
- Plan name + $497/month
- Status badge (Active/Past Due/Cancelled/Inactive)
- Next billing date
- "Manage Billing" button → /api/stripe/portal
- If inactive: "Subscribe Now" → /api/stripe/checkout

On /dashboard/scanner?subscribed=true: Sonner toast "Subscription active! Start scanning."

---

## 9. Phase 5 — Onboarding Flow

STEP 1: /onboarding/clinic
- Progress: Step 1 of 2
- Clinic Name (required text input)
- Logo upload (Supabase Storage bucket 'logos', PNG/JPG/WebP, max 2MB, show preview)
- "Continue" → save to profiles, redirect to /onboarding/treatments

STEP 2: /onboarding/treatments
- Progress: Step 2 of 2
- Heading: "What treatments does your clinic offer?"
- Checkbox grid (2 col desktop, 1 col mobile):
  * PRP (Platelet-Rich Plasma) — slug: prp
  * Stem Cell Therapy — slug: stem_cell
  * Exosomes — slug: exosomes
  * BMAC (Bone Marrow Aspirate Concentrate) — slug: bmac
  * Wharton's Jelly — slug: whartons_jelly
  * Prolotherapy — slug: prolotherapy
  * Peptide Therapy — slug: peptide
  * Other Regenerative Treatments — slug: other
- "Finish Setup" (disabled until 1+ selected) → save treatments, set onboarding_complete=true, redirect /dashboard/scanner
- "Skip for now" text link → set onboarding_complete=true, redirect /dashboard/scanner

---

## 10. Phase 6 — Core Compliance Scanner

PAGE LAYOUT:
- Two-column desktop (60/40), single column mobile
- Left: Input panel | Right: Results panel (hidden until scan runs)

INPUT PANEL:
- Heading: "Compliance Scanner"
- Subtext: "Paste any marketing content to check against current FDA/FTC guidelines."
- Content type segmented control: Website Copy | Social Post | Ad Copy | Email | Script | Other
- Textarea: 200px min, auto-grow, 5000 char max, live char counter (turns red at 4500+)
  Placeholder: "Paste your website copy, social caption, ad text, email, or any marketing content here..."
- "Scan for Compliance Issues" button (primary, full width, spinner during scan, disabled if empty)
- Disclaimer below button: "This tool provides educational guidance only and does not constitute legal or regulatory advice."

RESULTS PANEL (animates in after scan):

Section 1 — Score:
- Large circular ring gauge 0-100
- Colors: green 80-100, yellow 50-79, red 0-49
- Claude summary sentence below
- Stats row: X flags | X high | X medium | X low

Section 2 — Flags (if flags > 0):
- Original text displayed with highlights: red=high risk, orange=medium, blue=low
- Flag cards below: matched phrase badge, risk badge, reason (1 sentence), compliant alternative in green
- "Use this alternative" copy-to-clipboard button per flag

Section 3 — Rewrite:
- "Rewrite for Compliance" button (separate loading state)
- After rewrite: side-by-side diff (original with strikethrough left, clean rewrite right)
- "Copy Rewritten Text" button (shows checkmark for 2s after copy)
- "Re-scan Rewritten Text" button

Section 4 — Clean (if no flags):
- Green checkmark animation
- "No compliance issues found. This content appears safe to publish."
- "Always review with qualified healthcare marketing counsel before publishing."

/api/scan POST:
- Auth + subscription check
- Rate limit: 100/day via Upstash Redis (return 429 with message if exceeded)
- Fetch profile treatments
- Fetch active compliance_rules matching treatments (or applies_to empty)
- Claude claude-haiku-4-5 call with system prompt:
  "You are a regulatory compliance expert for FDA/FTC regenerative medicine marketing rules.
   Clinic treats: {treatments}
   Rules JSON: {rules_json}
   Analyze submitted content. Return ONLY valid JSON:
   {
     compliance_score: integer 0-100,
     summary: one sentence string,
     flags: [{
       rule_id, matched_text, banned_phrase, risk_level,
       reason (one sentence why it violates FDA/FTC),
       alternative (compliant rewrite of that phrase)
     }]
   }
   Score: 100=clean, 80-99=minor issues, 60-79=medium risk, 40-59=high risk, 0-39=multiple high risk.
   Match partial phrases, synonyms, and intent — not just exact strings.
   Return empty flags array and score 100 if clean. No text outside JSON."
- Parse + validate JSON response
- Record scan_duration_ms
- Save to scans table (all fields)
- Return scan record

/api/rewrite POST:
- Accept: { scan_id, original_text, flags }
- Auth + subscription check
- Rate limit: 100/day
- Verify scan_id belongs to user's profile
- Claude claude-sonnet-4-5 call:
  "You are a healthcare marketing compliance editor for regenerative medicine.
   Rewrite the content to be fully FDA/FTC compliant.
   Rules: never make disease treatment/cure claims, never claim FDA approval for unapproved therapies,
   use patient experience language (many patients report..., may support..., some patients experience...),
   always include hedging (individual results may vary, results not guaranteed),
   maintain original tone and length, do not add medical disclaimers not in original.
   Flagged phrases to replace: {flags_summary}
   Return ONLY the rewritten text. No explanations, no JSON."
- Update scans row with rewritten_text
- Return { rewritten_text }

---

## 11. Phase 7 — Scan History

LIST VIEW /dashboard/history:
- Heading: "Scan History"
- Stats bar: Total Scans | Average Score | High Risk Flags Caught (lifetime)
- Filters: Content Type dropdown | Date Range (7d/30d/90d/all) | Score range | Search bar
- Table columns: Date & Time | Content Type | Score | Flags | Preview (80 chars) | Actions (View, Re-scan icon)
  * Owner sees which team member ran each scan (avatar/initial)
  * Date shows relative time with full timestamp on hover
- Pagination: 20/page
- Empty state: "No scans yet. Head to the Scanner to check your first piece of content."

DETAIL VIEW /dashboard/history/[id]:
- Back button
- Full scanner results UI (same components as scanner results panel)
- Scan metadata: date, content type, duration, who ran it
- "Re-scan This Content" → navigate to /dashboard/scanner with text pre-filled
- "Export as PDF" button → GET /api/scans/[id]/export

PDF EXPORT /api/scans/[id]/export GET:
Build with @react-pdf/renderer:
- Header: RegenCompliance logo, clinic name, export date
- Compliance score (large)
- Original text section
- Flags table: phrase | risk | reason | alternative
- Rewritten text (if exists)
- Footer: "Generated by RegenCompliance. Educational purposes only. Not legal advice."
Return as application/pdf

/api/scans GET:
- Paginated, filtered for current profile_id
- Query params: page, limit, content_type, score_range, date_from, date_to

/api/scans/[id] GET:
- Full scan record, verify profile_id ownership

---

## 12. Phase 8 — Compliance Library

PAGE:
- Heading: "Compliance Library"
- Subheading: "Live database of FDA/FTC-flagged phrases. Updated automatically."
- "Last updated: [most recent rule date]" | "X rules tracked"

Filter bar:
- Search (real-time filter on banned_phrase + alternative)
- Risk Level pills: All | High | Medium | Low (multi-select)
- Category: All | Health Claims | FDA Approval | Efficacy | Safety | Testimonials
- Treatment: All | PRP | Stem Cell | Exosomes | BMAC | Wharton's Jelly | All Treatments

Two view modes (toggle): Card Grid | Table view

Card (1 col mobile / 2 col tablet / 3 col desktop):
- Risk badge top-right (red HIGH / yellow MEDIUM / blue LOW)
- Category tag
- Banned phrase in red pill
- Arrow icon
- Compliant alternative in green pill
- Footer: treatment tags | "View Enforcement Action →" (source_url) | source date

Table view columns: Risk | Banned Phrase | Compliant Alternative | Category | Treatments | Source | Date

Sticky disclaimer banner (dismissible, stored in localStorage):
"Using this library for reference? Always have final content reviewed by a qualified healthcare marketing attorney. Educational only, not legal advice."

/api/library GET:
- Return all active compliance_rules
- Optional params: risk_level, category, treatment, search
- Order: high risk first, then source_date DESC

---

## 13. Phase 9 — Notifications System

BELL (in dashboard header):
- Lucide Bell icon with red unread badge (hidden if 0)
- Fetches /api/notifications/unread-count (SWR refreshInterval: 60000)
- Click opens Popover (not page):
  * "Notifications" heading + "Mark all read" button
  * Scrollable list of last 10 notifications
  * Each item: unread border indicator, type icon, title, body (2 line truncation), relative time
  * Clickable if action_url exists → navigate to that route, mark read
  * "View all notifications →" link at bottom
- Clicking marks as read (PATCH /api/notifications/read)

/dashboard/notifications PAGE:
- Full paginated list (20/page)
- Same item format, full width
- Filter: All | Unread | Rule Updates | Enforcement Actions | Billing
- "Mark all read" button
- Empty state: "You're all caught up."

API /api/notifications GET:
- Return where profile_id = user's profile OR profile_id IS NULL
- Params: unread_only, type, page

/api/notifications/unread-count GET:
- Return { count: number }

/api/notifications/read PATCH:
- Body: { ids: string[] } or { all: true }

lib/notifications.ts:
- createBroadcastNotification(title, body, type, action_url?) — profile_id=null, uses service role
- createUserNotification(profile_id, title, body, type, action_url?) — specific profile

---

## 14. Phase 10 — Team Seats

OWNER VIEW at /dashboard/account/team:
- "Team Members" heading
- "X of 3 seats used" with progress bar
- Explanation copy
- Table: Member (avatar+email) | Role badge | Status (Active/Pending) | Remove button (confirm dialog, disabled for owner)
- "Invite Team Member" button (disabled with tooltip at 3/3)
- Invite Dialog:
  * Email input (Zod validated)
  * "Generate Invite Link" button
  * Shows magic link in read-only copyable input
  * Note: "Send this link directly. No email is sent automatically. Expires in 7 days."

MEMBER VIEW:
- Account page: Profile section read-only, no billing section, no team management
- Shows: "You are a member of [Clinic Name]'s account."

/api/team/invite POST (owner only):
- Check seat count (max 3 including owner)
- Generate secure random token: crypto.randomBytes(32).toString('hex')
- Insert team_members row: { profile_id: owner_id, email, role: 'member', invite_token: token }
- Generate Supabase magic link: admin.generateLink({ type: 'magiclink', email })
- Append ?invite_token=TOKEN to the magic link
- Return { invite_url }

/auth/callback route.ts — update to handle invite:
- After session exchange, check for invite_token in URL params
- If found:
  * Find team_members row by invite_token
  * Verify created_at < 7 days ago
  * Set user_id = new auth.uid(), accepted=true, accepted_at=now()
  * Redirect to /dashboard/scanner

lib/supabase/resolve-profile.ts:
export const effectiveProfileId = async (userId: string, supabase): Promise<string> => {
  const { data: member } = await supabase
    .from('team_members')
    .select('profile_id')
    .eq('user_id', userId)
    .single()
  return member?.profile_id ?? userId
}
Use this in EVERY API route to resolve profile_id.

/api/team GET — return all team_members for profile_id
/api/team/[id] DELETE (owner only, cannot delete self) — delete team_members row

---

## 15. Phase 11 — Account & Profile Page

/dashboard/account — single column stacked cards:

CARD 1 — Clinic Profile:
- Clinic Name (editable, saves on blur)
- Logo upload (Supabase Storage, shows preview)
- Treatment checkboxes (same as onboarding, editable)
- Save via PATCH /api/profile

CARD 2 — Appearance:
- Theme: Light / Dark / System (3-button segmented control)
- On change: useTheme() + PATCH /api/profile { theme_preference }

CARD 3 — Billing (owner only):
- Plan: RegenCompliance — $497/month
- Status badge
- Next billing date (from Stripe subscription)
- "Manage Billing & Payment Method" → POST /api/stripe/portal
- If inactive: "Subscribe Now" CTA → POST /api/stripe/checkout

CARD 4 — Team (owner only):
- "X of 3 seats used"
- "Manage Team →" link to /dashboard/account/team

CARD 5 — Usage This Month:
- Scans this month: X (from DB count)
- Daily limit: 100 scans/day, 100 rewrites/day
- "Daily limits reset at midnight UTC"

CARD 6 — Danger Zone:
- "Cancel Subscription" → confirm dialog → POST /api/stripe/portal (Stripe self-service cancel)

/api/profile PATCH:
- Accept subset of: clinic_name, logo_url, treatments, theme_preference
- Update profiles row
- Return updated profile

---

## 16. Phase 12 — FDA/FTC Cron Scraper

Install: cheerio

/api/cron/scrape-rules GET:
- Protect: check Authorization: Bearer {CRON_SECRET}

vercel.json:
{
  "crons": [{
    "path": "/api/cron/scrape-rules",
    "schedule": "0 9 * * *"
  }]
}

SCRAPER LOGIC:

Step 1 — FDA Warning Letters:
- Fetch https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/compliance-actions-and-activities/warning-letters
- Parse HTML with cheerio, extract recent warning letter links
- Filter for: "stem cell", "regenerative", "exosome", "PRP", "platelet", "biologic", "wharton", "BMAC"
- For each matching letter NOT already in compliance_rules (check source_url):
  * Fetch full letter page
  * Extract letter body text
  * Claude claude-haiku-4-5 call:
    "Extract the specific marketing phrases cited as violations in this FDA warning letter.
     For each: return { banned_phrase, reason (one sentence), compliant_alternative, risk_level }.
     Return as JSON array only."
  * INSERT each phrase into compliance_rules with source_url, source_name, source_date, risk_level='high'

Step 2 — FTC Press Releases:
- Fetch https://www.ftc.gov/news-events/news/press-releases
- Filter for: "stem cell", "health claims", "regenerative", "unproven"
- Same process: fetch, extract text, Claude extracts phrases, insert new rules

Step 3 — Notify if new rules added:
- Count new insertions
- If new_rules_count > 0:
  createBroadcastNotification(
    title: `Compliance Library Updated: ${new_rules_count} new rule(s) added`,
    body: `New FDA/FTC enforcement actions were processed. Review the latest rules in the Compliance Library.`,
    type: 'rule_update',
    action_url: '/dashboard/library'
  )

Step 4 — Log: { new_rules_count, duration_ms }. Return { success: true, new_rules: count }

ERROR HANDLING: wrap in try/catch, never throw, log errors and continue per source.

---

## 17. Phase 13 — Landing Page

STICKY NAV:
- Left: Shield icon + "RegenCompliance"
- Right: "Log In" link + "Start Now" primary button
- Mobile: hamburger menu

SECTION 1 — HERO:
Headline: "One compliance violation can shut down your clinic."
Subheadline: "RegenCompliance scans your marketing content against live FDA/FTC guidelines — before you publish. Built exclusively for regenerative medicine clinics."
CTAs: "Start for $497/month" (primary) | "See How It Works" (ghost, smooth scroll)
Trust badges: "No HIPAA data ever" | "Rules updated daily" | "Built for regen medicine"
Hero mock: styled div showing scanner UI with fake content

SECTION 2 — PROBLEM:
Heading: "The FDA and FTC are watching."
Stat cards:
- "200+ enforcement letters issued by FDA in 2024 — the highest in nearly 25 years"
- "$5.15M settlement — what deceptive stem cell marketing cost one clinic group in 2025"
- "Permanent marketing ban — the FTC's punishment for repeat violations"
Subtext: "One wrong word. One caption on Instagram. One email to your list. That's all it takes."

SECTION 3 — HOW IT WORKS (id="how-it-works"):
3-step cards:
1. "Paste Your Content" — copy any marketing text into the scanner
2. "Get Your Compliance Score" — see score, flagged phrases, and risk explanations instantly
3. "Rewrite in One Click" — AI rewrites with compliant alternatives, maintaining your tone

SECTION 4 — FEATURES (2-col grid):
- Live Compliance Scanner
- One-Click AI Rewriter
- Compliance Library (300+ rules)
- Daily Rule Updates (cron from FDA/FTC)
- Full Scan History + PDF Export
- 3 Team Seats Included

SECTION 5 — LIBRARY PREVIEW:
4 example rule cards (same design as library page):
- "heals" → "may support healing in some patients"
- "FDA-approved stem cells" → "performed in an FDA-registered facility"
- "cures arthritis" → "some patients report reduced joint discomfort"
- "proven to reverse aging" → "patients report feeling more youthful and energetic"
"View full library after signing up →"

SECTION 6 — PRICING:
Single pricing card (centered):
$497/month | "Cancel anytime"
Checklist:
- Unlimited compliance scans (up to 100/day)
- AI-powered compliant rewrites (up to 100/day)
- Full compliance library (300+ rules)
- Daily FDA/FTC rule updates
- Complete scan history + PDF export
- In-app enforcement action alerts
- 3 team seats included
- Light & dark mode
"Start Now" button → /login

SECTION 7 — FAQ (shadcn Accordion):
- "Is this actual legal advice?" — No. Educational tool only. Have content reviewed by healthcare marketing counsel.
- "Does this access patient data?" — Never. Text analysis only. No PHI, no HIPAA requirements.
- "How often are rules updated?" — Daily. Cron scrapes FDA and FTC every morning.
- "Who is this for?" — Regen clinics: PRP, stem cell, exosomes, BMAC, Wharton's jelly, prolotherapy, peptide.
- "What happens if I cancel?" — Access until end of billing period. No contracts.

FOOTER:
Logo + tagline | Privacy Policy | Terms of Service | Contact
Disclaimer: "RegenCompliance is an educational compliance tool and does not constitute legal or regulatory advice. Not affiliated with the FDA or FTC."
Copyright 2026 RegenCompliance.

---

## 18. Phase 14 — Rate Limiting + Hardening

Install: @upstash/redis @upstash/ratelimit

lib/rate-limit.ts:
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const scanRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 d'),
  prefix: 'regen:scan',
})
export const rewriteRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 d'),
  prefix: 'regen:rewrite',
})

Apply in /api/scan and /api/rewrite:
const { success } = await scanRateLimit.limit(userId)
if (!success) return Response.json({ error: 'Daily scan limit reached. Resets at midnight UTC.' }, { status: 429 })

ERROR HANDLING:
- app/error.tsx — global error boundary with "Try again" button
- app/not-found.tsx — 404 page with nav back to dashboard
- All API routes: try/catch, return { error: string, code: string }
- Claude failures: 503 "Compliance engine temporarily unavailable."
- Supabase failures: 503 generic, log full error server-side

LOADING STATES:
- Every async server component in Suspense with skeleton fallback
- Skeletons for: scan results, history table, library grid, notifications list

INPUT VALIDATION (lib/validations.ts with Zod):
- /api/scan: text = string 1-5000 chars, content_type = valid enum
- /api/rewrite: scan_id = valid UUID
- /api/team/invite: email = valid email format
- /api/profile: only allowed fields, no extra keys

SECURITY HEADERS (next.config.js):
X-DNS-Prefetch-Control: on
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: origin-when-cross-origin

SEO:
- metadata in app/page.tsx: title, description, og:title, og:description
- robots.txt: allow /, disallow /dashboard/ /api/ /onboarding/
- sitemap: only /

ENV VALIDATION (lib/env.ts with Zod):
Validate all required env vars at startup. Throw clear error if any missing.
Import in lib/supabase/server.ts to trigger on first server request.

---

## 19. Full Deployment Checklist

PRE-DEPLOY:
[ ] Supabase project created
[ ] Migration SQL run, seed data inserted
[ ] Supabase Storage bucket 'logos' created, public read enabled
[ ] Stripe product "RegenCompliance" created, $497/month recurring price
[ ] Stripe webhook endpoint: https://yourdomain.com/api/stripe/webhook
    Events: checkout.session.completed, customer.subscription.updated,
            customer.subscription.deleted, invoice.payment_failed
[ ] Upstash Redis database created, REST URL + token copied
[ ] All env vars added to Vercel project settings
[ ] vercel.json committed with cron config
[ ] Test magic link login end-to-end
[ ] Test Stripe checkout with test card 4242 4242 4242 4242
[ ] Test Stripe webhook locally: stripe listen --forward-to localhost:3000/api/stripe/webhook
[ ] Test cron manually: curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/scrape-rules
[ ] Test rate limit: run 101 scans, verify 429 on 101st
[ ] Test team invite: invite → accept in incognito → verify member sees shared history, not billing
[ ] Test PDF export from scan history
[ ] Test dark/light/system theme toggle persists after refresh
[ ] Test mobile layout on real device

VERCEL DEPLOY:
[ ] Connect GitHub repo to Vercel
[ ] Framework: Next.js (auto-detected)
[ ] Add all env vars in Vercel dashboard (Settings > Environment Variables)
[ ] Assign custom domain
[ ] Verify cron jobs in Vercel dashboard (Settings > Cron Jobs)
[ ] Enable Vercel Analytics (optional)

POST-DEPLOY:
[ ] Visit landing page, verify meta tags in view-source
[ ] Create first account, complete onboarding
[ ] Subscribe with test Stripe card
[ ] Run first scan, verify results render correctly
[ ] Check notification bell after Stripe webhook fires billing notification
[ ] Invite team member, accept, verify shared scan history and blocked billing page

---

## 20. Build Order Summary

Phase 1 — Scaffold + Auth + File Structure — 2 hrs
Phase 2 — Supabase Schema + Seed Data — 1.5 hrs
Phase 3 — Dashboard Layout + Sidebar + Theme — 2 hrs
Phase 4 — Stripe Subscriptions + Webhooks — 2 hrs
Phase 5 — Onboarding Flow — 1 hr
Phase 6 — Core Compliance Scanner — 4 hrs
Phase 7 — Scan History + Detail + PDF Export — 2.5 hrs
Phase 8 — Compliance Library — 1.5 hrs
Phase 9 — Notification System — 2 hrs
Phase 10 — Team Seats + Invite Flow — 2.5 hrs
Phase 11 — Account + Profile + Billing Page — 2 hrs
Phase 12 — FDA/FTC Cron Scraper — 2 hrs
Phase 13 — Landing Page — 2.5 hrs
Phase 14 — Rate Limiting + Hardening + Deploy — 2 hrs

TOTAL: ~30 hours
