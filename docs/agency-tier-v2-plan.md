# Agency Tier V2 — Implementation Plan

**Status:** Planned for post-beta / pre-public-launch. Recorded 2026-04-16.
**Timing:** Kick off after the 25 founders are stable; target before public launch.

## Pricing structure (final)

- **Base:** $997/mo = 5 company slots + 5 user seats
- **Extra company slot:** +$197/mo = 1 company slot + 1 user seat
- **Extra standalone seat:** +$47/mo = 1 user seat only
- Slots do **not** auto-free on company deletion; must explicitly downgrade plan.

## Phase 1 — Data model

New tables:
- `agencies` — id, owner_user_id, stripe_subscription_id, slot_count, seat_count, plan_tier
- `agency_companies` — agency_id, company_id, position (so deleted slot stays numbered)
- `agency_members` — agency_id, user_id, role (`agency_admin`, `agency_manager`, `company_user`), assigned_company_ids[]

Refactor existing:
- Move `profiles.treatments`, `clinic_name`, etc. from `profiles` → a new `companies` table.
- Solo accounts = agency with `slot_count=1`, `seat_count=1` (unifies the model — no two code paths).
- Add `company_id` FK to `scans`, `scan_flags`, `audit_events`.

## Phase 2 — Auth & scoping

- RLS policies: users can only see scans where `company_id IN (select company_id from agency_members where user_id = auth.uid())`.
- Agency admins see all companies in their agency; `company_user`s see only assigned companies.
- Update all 4 scan routes (`/api/scan`, `/api/scan-url`, `/api/scan-file`, `/api/demo/scan`) to resolve `company_id` from request context, not from `profile.treatments` directly.
- Add `X-Company-Id` header or `?company=` query param for the switcher.

## Phase 3 — Billing

- New Stripe products: `agency_base_997`, `agency_slot_addon_197`, `agency_seat_addon_47`.
- Subscription = base + quantity-based add-ons (Stripe handles proration automatically).
- Webhook: `customer.subscription.updated` recalculates `slot_count` and `seat_count` from quantities.
- Guardrails: block DELETE company if `agency.slot_count < used_slots` after deletion; block seat assignment if `agency.seat_count < assigned_seats`.

## Phase 4 — UI

- `/agency` — roll-up dashboard: all companies, compliance score per company, recent flags across clients, drill-in per company.
- Company switcher in nav (dropdown, recently-used, "All companies" view on agency routes only).
- `/agency/billing` — slot/seat counters, add/remove controls with live price preview.
- `/agency/team` — invite users, assign to companies, set roles.
- Per-company scanner/history pages scoped via URL: `/c/[companyId]/scan`, `/c/[companyId]/history`.

## Phase 5 — Migration & launch

- Backfill migration: every existing `profile` → company row + agency row with 1/1 counts.
- Feature flag `AGENCY_TIER_ENABLED` so it ships dark until Stripe + UI tested.
- Marketing page `/agency` with pricing calculator (N companies + M seats = $X/mo).
- Optional: grandfathered upgrade path — solo beta users who upgrade get first agency month 50% off.

## Deferred past V2

- Client-facing white-label (logo, custom domain per agency)
- Consolidated PDF reports across all companies
- Agency-level audit trail roll-up
- Standalone seat tier (already in this plan, but could start slot-only if timeline is tight)

## Recommended sequencing

1. Finish beta, get 25 founders stable, learn what they actually need.
2. Phase 1 (data model refactor) — biggest lift; do it when no one's using the app heavily.
3. Phase 2 + 3 in parallel (auth and billing are independent).
4. Phase 4 is pure UI; can overlap with late-stage Phase 2.
5. Phase 5 ships the flag flip.
