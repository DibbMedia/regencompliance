# Secret Rotation Schedule

**Last reviewed:** 2026-04-24.

All secrets live in Vercel Environment Variables (Sensitive scope) for Production and Preview. None are checked into git; verified via `git log --all -p -S` for all common secret patterns (2026-04-24).

## Rotation cadence

| Secret | Cadence | Last rotated | Procedure |
|---|---|---|---|
| `CRON_SECRET` | 90 days | 2026-04-24 | `openssl rand -hex 32` → Vercel env → redeploy |
| `ENCRYPTION_KEY_V1` | See note below | 2026-04-24 | Never rotated in place — add V2, re-encrypt envelopes, retire V1 |
| `STRIPE_RESTRICTED_KEY` | 180 days | 2026-04-24 | Stripe Dashboard → API keys → Roll key → update Vercel env |
| `STRIPE_WEBHOOK_SECRET` | 365 days (or on incident) | 2026-04-21 | Stripe Dashboard → Webhooks → (endpoint) → Reveal → rotate |
| `SUPABASE_SERVICE_ROLE_KEY` | 365 days (or on incident) | — | Supabase Dashboard → Settings → API → Reset → update Vercel env |
| `ANTHROPIC_API_KEY` | 180 days | — | Anthropic Console → API keys → Regenerate → update Vercel env |
| `RESEND_API_KEY` | 180 days (when active) | n/a | Resend Dashboard → API keys → Regenerate |

## Encryption key rotation (ENCRYPTION_KEY_V1 → V2)

The application-layer encryption key is versioned in the envelope prefix (`v1.<body>`). Rotation process when needed:

1. Generate `ENCRYPTION_KEY_V2` with `openssl rand -hex 32`. Add to Vercel env, keep V1 active.
2. Ship code change: `encrypt()` uses V2, `decrypt()` dispatches on prefix (v1/v2).
3. Run a background migration: for every encrypted column, read (decrypts under V1), re-write (encrypts under V2). Emits `v2.` envelopes.
4. Verify no `v1.` prefixes remain in the DB.
5. Remove V1 code path and env var.

Cadence: every 2 years or on suspected compromise. No caller exists yet as of 2026-04-24.

## Rotation-triggering events (immediate, not scheduled)

- Suspected or confirmed key exposure (git commit, log, screen share, dump)
- Employee offboarding with secret access (no employees today)
- Vendor breach notification affecting the key's provider
- Any Sev-1 incident where a key may have been observed

## After-rotation verification

For each rotation, verify:

1. New value is trim-clean (`openssl rand -hex 32` output has no whitespace)
2. Old value marked removed / invalidated at provider
3. Vercel redeploy completes successfully
4. Smoke test the paths that use the secret (see `docs/adversarial-probes.md` for test patterns)
5. Audit log shows no 401/403 spike in the hour after cutover

## Where rotation is *not* needed

- `NEXT_PUBLIC_*` values — public by design, no rotation cadence
- `STRIPE_PRICE_ID`, `STRIPE_BETA_PRICE_ID` — identifiers, not secrets
- `ADMIN_EMAIL` — identifier, not a secret
