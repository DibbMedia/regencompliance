# Data Retention & Deletion Policy

**Scope:** All customer and operational data in RegenCompliance.
**Last reviewed:** 2026-04-24.

## Data categories and retention

| Category | Examples | Retention | Basis |
|---|---|---|---|
| **Account data** | `profiles`, `auth.users`, `team_members` | Lifetime of subscription + 30 days after cancellation, then purged by `/api/cron/purge-cancelled` | Contract + GDPR Article 6(1)(b) |
| **Scan history** | `scans.original_text`, `scans.flags`, `scans.rewritten_text` | Lifetime of subscription, deleted with account | Contract + user expectation |
| **Support tickets** | `support_tickets`, `ticket_messages` | Lifetime of subscription, deleted with account | Contract |
| **Billing records** | `beta_purchases`, Stripe customer records | 7 years after last transaction | Tax / financial regulation |
| **Audit log** | `audit_log` (admin actions, login events, webhook events) | 1 year rolling | SOC 2 + IR forensics |
| **Rate-limit state** | `rate_limits` | Auto-expires per row; housekeeping removes >1-day-old rows | Operational |
| **Webhook dedup** | `webhook_events` | 90 days rolling (manual cleanup recommended) | Replay protection window |
| **Waitlist / newsletter** | `waitlist`, `newsletter_subscribers` | Until user unsubscribes or 3 years of inactivity | Marketing consent + GDPR Article 6(1)(f) |
| **Monitored-site pages** | `monitored_sites`, `site_pages` | Lifetime of subscription, cascade-deleted with profile | Contract |
| **Compliance-rule library** | `compliance_rules`, `enforcement_actions` | Permanent (public regulatory data) | Product data, not customer data |
| **Logos** | Storage bucket `logos` | Lifetime of subscription | Contract |
| **Impersonation sessions** | `impersonation_sessions` | 30-minute TTL, expired rows eligible for purge | Security |

## Deletion triggers

### User-initiated delete (right to erasure, GDPR Article 17)

Endpoint: `POST /api/user/delete` with `{ confirm: true }`.

Order of operations (atomic-ish, best-effort):

1. Cancel Stripe subscription (if active)
2. Delete `scans` rows
3. Delete `ticket_messages` then `support_tickets`
4. Delete `api_usage` records
5. Delete `notifications`
6. Delete `team_members`
7. Delete `profiles` row
8. Null out `user_email` in `audit_log` rows (preserve action/resource for forensics, strip PII)
9. Call `supabase.auth.admin.deleteUser(user_id)` — removes from `auth.users`
10. Send confirmation email (best-effort; account already gone)

Cascade-delete on FKs handles any rows keyed off `profile_id` (`monitored_sites` → `site_pages`, etc.).

Audit trail preserved: `action = 'account.deleted'` in `audit_log` with `user_id` retained for 1 year, `user_email` nulled.

### Automated cancel-purge

Cron `purge-cancelled` runs daily at 04:00 UTC. Criteria: `subscription_status = 'cancelled'` AND `updated_at < now() - 30 days`. Calls `auth.admin.deleteUser` for each; cascade handles the rest.

### Retention-window sweeps (manual, quarterly)

- `audit_log` older than 1 year: `DELETE FROM audit_log WHERE created_at < now() - interval '1 year';`
- `webhook_events` older than 90 days: `DELETE FROM webhook_events WHERE processed_at < now() - interval '90 days';`
- Unconfirmed newsletter subscribers inactive >3 years: tracked, not yet automated.

## Data export (right to access, GDPR Article 15)

Endpoint: `POST /api/user/export`. Returns JSON download containing:
- Profile row
- All scans with flags + rewrites
- Support tickets + messages
- Notifications
- Team members

Rate-limited to 5/day per user. Audited as `action = 'data.exported'`.

## Data we never collect

- Patient names, DOB, MRN, SSN, insurance IDs — `lib/phi-filter.ts` rejects at scan time
- Credit card numbers — Stripe collects directly, we only see `stripe_customer_id` and subscription status
- IP addresses in non-audit tables — only stored on `waitlist`, `newsletter_subscribers`, and `audit_log`

## Backup retention

Supabase automatic daily backups: 7 days (free tier) or longer with Pro.
Point-in-time recovery: enabled (per session 2026-04-24 action list) for 7-14 day window.

Backups contain all tables including deleted-user history for up to their retention period. If a user exercises right-to-erasure, their data is purged from live DB immediately but may persist in backups until the backup cycles out naturally. Documented GDPR best practice; acceptable under Article 17(3).

## Review cadence

Annual, or when a new data-producing feature ships.
