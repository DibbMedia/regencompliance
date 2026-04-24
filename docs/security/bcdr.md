# Business Continuity & Disaster Recovery

**Scope:** RegenCompliance SaaS.
**Last reviewed:** 2026-04-24.

## Objectives

- **RTO (Recovery Time Objective):** 4 hours for Sev-1 outages
- **RPO (Recovery Point Objective):** 24 hours of data loss worst case (nightly Supabase backup cycle), 0 minutes with PITR enabled

## Scenarios

### S1 — Vercel complete outage

**Likelihood:** Low (Vercel has multi-region redundancy).
**Impact:** Site unreachable; cron jobs don't fire; checkout fails.
**Response:**
1. Confirm via https://www.vercel-status.com
2. Post a Twitter/X update + email active customers via Resend (if running)
3. Wait for Vercel recovery — no self-service failover available on current plan
4. If >4 hours, invoke vendor replacement plan (see Vendor Risk doc): move Next.js app to AWS Amplify or Cloudflare Pages manually

**RTO if Vercel recovers on its own:** whatever Vercel takes.
**RTO if we migrate:** ~8 hours including DNS propagation.

### S2 — Supabase database loss

**Likelihood:** Very low.
**Impact:** All customer data inaccessible.
**Response:**
1. Confirm via https://status.supabase.com
2. If PITR is enabled (pending confirmation in action list), restore to last good timestamp
3. Otherwise restore from latest daily automatic backup (max 24h data loss)
4. Re-run migrations if schema is out of sync
5. Verify RLS policies still active (re-run adversarial probes)

**RTO:** 2-4 hours.
**RPO:** 0 minutes (PITR) or 24 hours (daily backup only).

### S3 — Domain / DNS loss

**Likelihood:** Very low (Registrar Lock + 2FA).
**Impact:** Site unreachable even if infra is fine.
**Response:**
1. Log into Namecheap via 2FA
2. Restore DNS records from last known good state
3. If registrar is compromised: contact Namecheap support, initiate transfer lock + password reset
4. If transfer occurred to an attacker: invoke ICANN dispute process (takes days)

**RTO:** 1 hour (simple DNS) to several days (hijack recovery).

### S4 — Source code compromise (GitHub hijack)

**Likelihood:** Very low (2FA + push protection + SHA-pinned Actions).
**Impact:** Malicious code could deploy to prod if attacker controls GH.
**Response:**
1. Revoke the compromised GitHub session via Settings → Sessions
2. Force logout all sessions
3. Rotate GitHub PAT + SSH keys
4. Roll back to last known-good commit on `main`
5. Rotate every secret the compromised branch could have exfiltrated (Stripe, Supabase, Anthropic, Cron, Encryption)
6. Audit recent commits by all contributors

**RTO:** 2-4 hours.

### S5 — Credential leak (Stripe / Supabase / Anthropic / Cron / Encryption)

See `docs/security/incident-response.md` containment playbook.

**RTO:** 15 minutes to rotate + redeploy; 1 hour for full forensic timeline.

### S6 — Ransomware / data-destruction attack

**Likelihood:** Very low (no on-prem infra).
**Impact:** Supabase data lost or corrupted.
**Response:** Restore from PITR (minutes-granular) or daily backup. Rebuild from snapshot.

**RTO:** 2-4 hours.

## Backup strategy

### Supabase automatic daily backups

- Retention: 7 days (free tier), longer with Pro
- Point-in-time recovery: enabled in dashboard (pending confirmation in action list)
- Tested: manually verify quarterly (restore to a throwaway project, confirm row counts)

### Source code

- Primary: GitHub (`DibbMedia/regencompliance`)
- Local working copy: OneDrive-synced to the origin machine `fxisa` + local cache
- Any machine with the repo cloned is a de-facto backup

### Env vars

- Stored in Vercel (Sensitive)
- Not backed up elsewhere — they're regeneratable on rotation
- Rotation procedure doc: `docs/security/rotation-schedule.md`

### Configuration docs

- This `docs/` folder in git
- Git history preserves all prior versions

## Recovery test cadence

- **Quarterly:** restore a single Supabase backup to a throwaway project, confirm row counts match the source.
- **Annually:** full BCDR walkthrough — simulate Vercel outage, demonstrate alternate-host deploy path (even if not fully executed).

## Open gaps

- **Status page** — not yet running. Recommendation: add https://instatus.com or a Vercel-hosted static page with incident history.
- **Customer communication channel** — no mailing list for incidents. Partial fix: Resend (when live) + in-dashboard banner.
- **No redundant hosting** — only on Vercel. Adequate for MVP; revisit when revenue supports hot standby.
