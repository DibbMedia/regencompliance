# Archived backfill scripts

These scripts ran ONCE pre-cutover on 2026-05-13 to encrypt every existing
plaintext row's `*_enc` counterpart before migrations 034/036/038/040/042
dropped the plaintext columns.

**DO NOT re-execute.** Every script in this directory selects plaintext
columns that no longer exist; running them now will fail with PGRST204
immediately.

| Script | Pairs with migration | What it encrypted |
|---|---|---|
| `backfill-profiles.ts` | 033 → 034 | profiles.clinic_name, profiles.treatments, team_members.email |
| `backfill-scans-sites.ts` | 035 → 036 | scans.original_text/rewritten_text/flags/source_url, monitored_sites.domain/name, site_pages.url/title |
| `backfill-tickets-notifications.ts` | 037 → 038 | support_tickets.subject, ticket_messages.message, notifications.title/body/action_url |
| `backfill-audit-impersonation.ts` | 039 → 040 | audit_log.user_email/details/ip_address/user_agent, impersonation_sessions.admin_email/target_email |
| `backfill-leads.ts` | 041 → 042 | waitlist/beta_applications/free_audit_leads/newsletter_subscribers/beta_purchases (10+ cols across 5 tables) |

Git history retains the original content. They live here as evidence of
the migration steps for SOC 2 audit trail purposes.

Future key-rotation (V1 → V2) uses `scripts/key-rotation.ts` (still a
stub as of 2026-05-13).
