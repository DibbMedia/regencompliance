# Key Custody Runbook

**Last reviewed:** 2026-05-13.
**Owner:** Dibb Media.
**Applies to:** `ENCRYPTION_KEY_V1` (the master key for all application-layer encryption — see [`encryption-architecture.md`](./encryption-architecture.md)).

> **WARNING - Loss of the master key is unrecoverable.**
> If `ENCRYPTION_KEY_V1` is lost AND every backup copy is lost, every encrypted user data column (PII, scans, audit log, lead capture) becomes permanently undecryptable. There is no escrow, no provider recovery, no derivation source other than the 32 random bytes themselves. Treat the backup procedure below as non-optional.

## 1. Access list

| Holder | Location | Role |
|---|---|---|
| Dibb Media owner (`seo@dibbmedia.com`) | Vercel env (`ENCRYPTION_KEY_V1`, Sensitive scope), 1Password vault, sealed offline backup | Primary custodian |
| Vercel Team admins on the RegenCompliance project | Vercel env (read by deployments only; admins can rotate but should not display the value casually) | Operational access via the Vercel UI |

Nobody else. No Supabase staff, no Stripe staff, no Anthropic staff, no contractor, no support tooling has the master key. The key never leaves a) Vercel's encrypted env store, b) the owner's password manager, c) the sealed offline backup.

## 2. Backup procedure

The key MUST exist in at least two copies, on different media, in geographically separated locations:

1. **Password manager (primary)** - Store the 64-char hex value in 1Password (or Bitwarden) under a dedicated entry labelled `RegenCompliance - ENCRYPTION_KEY_V1 - master`. Include the generation date and the matching Vercel env-var name in the entry notes. Enable the password manager's account recovery (kit / sealed envelope) per its own best practice.
2. **Sealed offline backup** - Write the key to an encrypted USB drive (VeraCrypt or BitLocker) OR a printed sheet stored in a locked location (home safe, safe-deposit box). Label with: env var name, generation date, instructions to refuse exposure to anyone who is not the named custodian.
3. **Vercel env (operational copy)** - Already present as the deployment source of truth. Marked Sensitive. Vercel keeps cold-storage backups of env values per their own SOC 2 policy; we treat this as the operational copy, not as a recovery source.

Verification cadence: confirm both backup copies match the live Vercel value at every rotation event and at every annual security review.

## 3. Rotation procedure

Rotate `ENCRYPTION_KEY_V1` annually, or immediately on suspected compromise. The application supports rolling forward to a `V2` key via envelope version prefixes (see [`encryption-architecture.md`](./encryption-architecture.md) - the dispatcher reads `v1u.` / `v2u.` etc. and routes to the right key during the overlap window).

1. **Generate V2.** On a trusted machine, run:
   ```bash
   openssl rand -hex 32
   ```
   Verify the output is exactly 64 lowercase hex chars (no trailing newline, no whitespace).

2. **Stage V2 in env.** In Vercel, add `ENCRYPTION_KEY_V2` to Production and Preview as Sensitive. Leave `ENCRYPTION_KEY_V1` in place. No deploy yet.

3. **Run the re-encryption harness.** Execute `npm run rotate-keys` (script: `scripts/key-rotation.ts`). The harness iterates every encrypted column in every encrypted table, decrypts under V1, re-encrypts under V2, writes the `v2u.` / `v2r.` / `v2s.` envelope back. Idempotent and resumable. (v1 status: skeleton only - not implemented yet; the harness will throw on invocation until the next rotation event funds the implementation.)

4. **Verify a sample.** Spot-check 10 random rows per encrypted table - confirm the envelope prefix is now `v2*.` and the repo decrypts correctly via the dispatch path.

5. **Deploy app that prefers V2.** Ship the code change that prefers V2 envelopes for new writes. V1 envelopes still decrypt because the dispatcher honors the prefix.

6. **Soak for 7 days.** Watch the error log for V1 decrypt failures (should be zero — all writes are now V2; only late-arriving reads of pre-rotation rows touch V1).

7. **Remove V1 from env.** After the 7-day soak with no V1 decrypt failures, delete `ENCRYPTION_KEY_V1` from Vercel. Update both backup copies to the V2 value, archive the V1 backup as superseded (do not delete the V1 backup for at least 30 days in case a forgotten row surfaces).

8. **Update logs.** Note the rotation date in [`rotation-schedule.md`](./rotation-schedule.md).

## 4. Disaster recovery

> Losing `ENCRYPTION_KEY_V1` permanently = unrecoverable user data. No fallback exists.

| Scenario | Response |
|---|---|
| Vercel env wiped, both backups intact | Restore from 1Password into Vercel; redeploy. No data loss. |
| Vercel env wiped, 1Password intact, offline backup lost | Restore from 1Password; immediately regenerate the offline backup. |
| Vercel env wiped, 1Password lost, offline backup intact | Restore from offline; immediately rebuild the 1Password entry. |
| Vercel env intact, both backups lost | Re-create both backups from the live Vercel value (export carefully, do not log). |
| All three copies lost | Catastrophic. Encrypted columns are unrecoverable. Document the loss as a Sev-1 incident, notify users per [`incident-response.md`](./incident-response.md), prepare data-loss disclosure under GDPR Art. 33/34 (72-hour clock). The fallback business posture is: unauthenticated metadata (timestamps, status enums, Stripe IDs) survives; all encrypted user content is permanently lost. |

## 5. Incident response (suspected exposure)

If `ENCRYPTION_KEY_V1` is suspected to have leaked - via OneDrive sync, accidental log capture, screen share, git commit, or any other channel - treat as a Sev-1:

1. **Rotate immediately** using the procedure in §3. Don't wait for the annual cadence.
2. **Audit decrypt access logs** for the exposure window. Any decrypt during the window that you can't tie to a known user request should be investigated.
3. **Audit Vercel env access logs** to confirm who pulled the key value and when.
4. **If exposure was via git** - rotate AND treat the repo as tainted: `git filter-repo` to scrub the commit, force-push, notify all collaborators, treat all secrets in adjacent env vars as also potentially exposed.
5. **Follow the incident-response runbook** at [`incident-response.md`](./incident-response.md) for the broader Sev-1 response (notifications, RCA, post-mortem).
6. **Update this document's "Last reviewed" date** to reflect the rotation.

## 6. Annual review checklist

Performed every May (anniversary of v1 launch):

- [ ] Confirm 1Password entry matches Vercel env value
- [ ] Confirm offline backup matches Vercel env value
- [ ] Confirm access list still accurate (no offboarded staff retain backups)
- [ ] Confirm last rotation date is within annual cadence
- [ ] Confirm `scripts/key-rotation.ts` is implemented (or scheduled to be) before the next rotation
- [ ] Update "Last reviewed" date in this document

## References

- [`encryption-architecture.md`](./encryption-architecture.md) - what is encrypted, with what algorithms
- [`rotation-schedule.md`](./rotation-schedule.md) - cadence for all secrets
- [`incident-response.md`](./incident-response.md) - Sev-1 playbook
- [`access-control.md`](./access-control.md) - broader access policy
- `lib/crypto.ts` - implementation (with fallback-collision refusal in production)
- `scripts/key-rotation.ts` - rotation harness (skeleton)
