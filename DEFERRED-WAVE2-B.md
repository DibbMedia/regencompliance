# Wave 2B — Deferred items

Wave 2B (`feat(encryption): Phase 3 scans + sites migration + callsite swap`) does NOT touch the items below. They are either out of this wave's vertical slice or owned by a different wave.

## Deferred to a later wave

### `app/api/admin/stats/route.ts` — per-row scan flags decryption

**Lines:** approx. 131-161 (the `scoreData` aggregation block).

The route runs a service-role `select("compliance_score, flag_count, flags")` over **every scan in the database**, then walks `flag.banned_phrase` / `flag.reason` to compute the "most common violation" aggregate. Once migration 036 drops the plaintext `flags` column, the existing read returns only `flags_enc` envelopes which iterate as 0 violations.

The fix is per-row decryption with the row's own `profile_id` as the tenant key:

```ts
// Add to the select:
//   "id, profile_id, compliance_score, flag_count, flags_enc, flags"
// Then per-row, inside withCryptoRequestScope:
//   const flags = scan.flags_enc != null
//     ? decryptJSONForUser<Flag[]>({
//         userId: scan.profile_id,
//         envelope: scan.flags_enc,
//         table: "scans", column: "flags", rowId: scan.id,
//       })
//     : (scan.flags as Flag[] | null) ?? []
```

The route already calls service-role `.select("*")`-style queries across other tables, but **this is the only scan-table read in admin/stats that needs the encrypted-flags walk**. Counts (`flag_count`, `compliance_score`) stay plain and need no change.

This is deferred because:
- Wave 2B's scope is "scans + monitored_sites + site_pages owned callsites." The admin stats page is owned by an admin-aggregation wave (Wave 2C+).
- Iterating every scan with HKDF + AES per row is fine for founder-beta scale but should be batched/scoped (e.g. only last-30-days, or cached) when the dataset grows. That tuning is part of the admin-aggregation wave.

**Action item for the next wave:** add the `flags_enc` decryption block above; verify the "most common violation" tile still renders the right phrase against a populated DB.

## Confirmed clean (no edits needed)

### `app/api/stripe/webhook/route.ts`
Grepped for `scans`, `monitored_sites`, `site_pages` — zero matches. The webhook touches `profiles`, `notifications`, `audit_log`, `beta_purchases` only (those belong to other waves).

### `app/auth/callback/route.ts`
Grepped for `scans`, `monitored_sites`, `site_pages` — zero matches. Touches `profiles`, `beta_purchases`, `team_members` only.

### `app/api/admin/scans/route.ts` (admin scans list)
Reads `id, profile_id, content_type, compliance_score, flag_count, created_at` only. No encrypted columns selected. No edits needed.
