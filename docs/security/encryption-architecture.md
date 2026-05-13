# Application-Layer Encryption Architecture

**Last reviewed:** 2026-05-13.
**Owner:** Dibb Media.
**Status:** Live (migrations 033-042 applied; cutover via Phase 5/6).

This document is the audit-facing summary of how RegenCompliance encrypts sensitive user data at rest. It supersedes the relevant sections of `docs/user-level-encryption-plan.md` for SOC 2 evidence purposes; the plan remains in the repo as the project's historical record.

## Scope

RegenCompliance encrypts every plaintext column that contains user-supplied PII, scan content, AI output, or pre-auth lead data. The crypto boundary is the application server (Next.js / Vercel). The database (Supabase Postgres) sees ciphertext only; Storage objects and `auth.users` are out of scope (see [Boundaries](#boundaries) below).

| Domain | Tables | Tenant key | Envelope |
|---|---|---|---|
| Authenticated PII | `profiles`, `team_members` | user_id / profile_id | `v1u.` |
| Scan content + AI output | `scans`, `monitored_sites`, `site_pages` | profile_id | `v1u.` |
| Support + notifications | `support_tickets`, `ticket_messages`, `notifications` | profile_id | `v1u.` (per-recipient where applicable) |
| Audit log + impersonation | `audit_log`, `impersonation_sessions` | user_id, or system when null | `v1u.` / `v1s.` |
| Pre-auth lead capture | `waitlist`, `beta_applications`, `free_audit_leads`, `newsletter_subscribers`, `beta_purchases` | row.id | `v1r.` |

## Key hierarchy

```
ENCRYPTION_KEY_V1   (32 B, Vercel env, Sensitive scope)
   |
   | HKDF-SHA256(ikm=master, salt=subject_uuid_bytes, info=domain, length=32)
   v
Per-subject DEK    (32 B, derived on demand, request-scoped cache)
   |
   | AES-256-GCM(key=DEK, iv=random 12 B, aad=context, plaintext)
   v
Envelope: "<version>.<base64url(iv || ciphertext || tag)>"
```

Three derivation flavours, each with its own HKDF `info` string for domain separation:

- **Per-user DEK** - `info = "regen:user-dek:v1"`, salt = `auth.uid` UUID raw bytes. Envelope prefix `v1u.`. Used for everything tied to an authenticated user.
- **Per-row DEK** - `info = "regen:row-dek:v1"`, salt = row's UUID raw bytes. Envelope prefix `v1r.`. Used for pre-auth lead rows where no `user_id` exists.
- **System master-key envelope** - no derivation; the master key encrypts directly. Envelope prefix `v1s.`. Used for NULL-user audit-log rows and broadcast content where there is no tenant subject.

The legacy `v1.` envelope (master key, optional AAD) survives in the code for backward compatibility but is not used by any current callsite.

## Algorithms

| Primitive | Choice |
|---|---|
| Symmetric cipher | AES-256-GCM |
| IV | 12 random bytes per message |
| Auth tag | 16 bytes |
| KDF | HKDF-SHA256, 32-byte output |
| HMAC (lookup / signing) | HMAC-SHA-256 (currently unused in v1 production paths) |
| Master key entropy | 32 bytes / 256 bits (`openssl rand -hex 32`) |

Additional Authenticated Data (AAD) binds every ciphertext to its location:

```
AAD = "<table>:<column>:<rowId>"
```

This prevents an attacker with DB write access from relocating ciphertext from one row/column to another - decryption with mismatched AAD throws a GCM auth-tag failure.

## Envelope format

```
<version>.<base64url(iv (12B) || ciphertext || tag (16B))>
```

Version prefixes in use:

- `v1u.` - per-user DEK; AAD required
- `v1r.` - per-row DEK; AAD required
- `v1s.` - system master-key; AAD required
- `v1.`  - legacy single-key envelope, AAD optional (no current callsites)

The dispatcher (`decryptAny`) reads the prefix and routes to the right key path. Future rotation introduces `v2u.` / `v2r.` / `v2s.` alongside the v1 prefixes; the dispatcher decrypts either during the overlap window.

## Threat model

**Defends against:**

- Stolen Supabase database backup or live DB dump
- SQL injection that exfiltrates ciphertext
- Leaked `SUPABASE_SERVICE_ROLE_KEY` without simultaneous access to Vercel env
- Compromised DB-only admin (RLS bypass that does not also yield env access)
- Malicious or compelled Supabase operator
- GDPR right-to-be-forgotten via crypto-shredding (drop the user's DEK derivation input by deleting the user row)

**Does NOT defend against:**

- Compromised Vercel runtime (env + DB both accessible)
- Compromised or lost master key (see [Key Custody](./key-custody.md))
- Application bugs that leak plaintext via API responses
- Compromised user account (legitimate decrypt for that user's own data)

See [`threat-model.md`](./threat-model.md) for the broader STRIDE pass; this document narrows to the at-rest crypto layer.

## Boundaries (intentional plaintext)

- **GHL CRM** - The Contacts API receives plaintext PII at write time (signup, beta apply, free audit, Stripe events). This is intentional: GHL is the system of record for marketing and lifecycle communication. GHL is a trusted vendor under our SOC 2 vendor-risk inventory (see [`vendor-risk.md`](./vendor-risk.md)).
- **`auth.users.email`** - Supabase Auth owns this column. It is plaintext on the Supabase side, by their design. Acceptable: Supabase is SOC 2 Type II. Email-based admin lookups pivot through this table (via the `find_auth_user_id_by_email` RPC, migration 030).
- **Storage objects (logos)** - The `logos` bucket is public-read; encrypting the file would be theatre when the URL itself is shared publicly. The `logo_url` column stays plain.
- **Stripe IDs** - `stripe_customer_id`, `stripe_subscription_id`, `stripe_session_id` stay plain because webhook lookups require equality joins.
- **UUIDs, timestamps, status enums, scores, counts** - All non-content metadata stays plain (used in aggregates, sorting, RLS predicates).

## Search behavior

Full opacity by design. No blind-indexed lookups, no deterministic HMAC side channels.

- **User search by email** dies on the encrypted columns (`team_members.email`, pre-auth lead emails). Admin user lookup pivots to `user_id` via the `find_auth_user_id_by_email` RPC, which queries the unencrypted `auth.users` table.
- **Operator workflows that previously grep'd `clinic_name`** are gone; admin pivots through `auth.users.email` to `user_id` then loads the encrypted profile and decrypts server-side.
- **Free-audit dedup and beta-seat reservation** operate on `row.id` (or a deterministic non-PII hash for dedup keys, where present), not on encrypted email content. The `reserve_beta_seat` RPC and free-audit caps work unchanged after cutover.

## Reservation-token claim flow

Pre-cutover, `beta_purchases` was looked up by `stripe_customer_email` (plaintext) at the auth callback to claim a beta seat. Post-cutover, the email column is `v1r.`-encrypted, breaking equality lookups.

The replacement is a reservation-token flow:

1. Stripe checkout completion writes a random `reservation_token` (UUID, plain) onto the `beta_purchases` row.
2. The Stripe success URL carries `?reservation=<token>` to the auth callback.
3. `claimBetaPurchase` looks the row up by token (plain UUID), decrypts the email server-side, and binds the row to the now-authenticated `user_id`.

This preserves the original UX (one-tap seat claim post-checkout) without leaking a plaintext email column.

## Migrations

| # | Phase | Effect |
|---|---|---|
| 033 | 5A | Add `*_enc` columns to `profiles`, `team_members` (additive) |
| 034 | 5A | Drop plaintext columns on `profiles`, `team_members` (cutover) |
| 035 | 5B | Add `*_enc` columns to `scans`, `monitored_sites`, `site_pages` |
| 036 | 5B | Drop plaintext columns on `scans`, `monitored_sites`, `site_pages` |
| 037 | 5C | Add `*_enc` columns to `support_tickets`, `ticket_messages`, `notifications` |
| 038 | 5C | Drop plaintext columns on tickets + notifications |
| 039 | 5D | Add `*_enc` columns to `audit_log`, `impersonation_sessions` |
| 040 | 5D | Drop plaintext columns on audit + impersonation |
| 041 | 6  | Add `*_enc` columns to lead-capture tables; drop UNIQUE constraints on plaintext emails (replaced by deterministic dedup keys where needed) |
| 042 | 6  | Drop plaintext columns on lead-capture tables |

Backfill scripts under `scripts/backfill-*.ts` are idempotent and resumable. Each phase ships an additive migration first, runs the backfill against production, verifies sampled decrypts, then ships the drop migration.

## References

- [`./key-custody.md`](./key-custody.md) - master-key ownership, backup, rotation, DR
- [`./rotation-schedule.md`](./rotation-schedule.md) - rotation cadence for all secrets
- [`./threat-model.md`](./threat-model.md) - full STRIDE-lite pass
- [`./data-classification.md`](./data-classification.md) - what counts as sensitive
- [`./vendor-risk.md`](./vendor-risk.md) - Supabase, GHL, Stripe, Anthropic, Vercel
- `docs/user-level-encryption-plan.md` - original project plan (retained for history)
- `lib/crypto.ts` - implementation (HKDF, AES-GCM, envelope codec)
- `lib/repos/*.ts` - all DB access for encrypted columns goes through these
