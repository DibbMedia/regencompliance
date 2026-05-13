# Wave 2A — Deferred callsite migrations

Shared-file hotspots per `docs/user-level-encryption-plan.md` §12.9. These
files are intentionally NOT modified in the Wave 2A vertical slice because
they touch multiple Phase-2-onward tables (profiles + notifications +
audit_log + beta_purchases + team_members + waitlist + free_audit_leads).
The integration pass at the end of Wave 2 (after Wave 2B also lands) folds
all of these in one merge to avoid stomping on each agent's edits.

For each entry the tenant key (`userId` for `decryptForUser` / `getProfile`)
is given so the integration agent doesn't have to re-derive it.

---

## 1. `app/api/stripe/webhook/route.ts`

All five `clinic_name` reads happen inside a Stripe-event branch where the
profile id is already resolved (either via `stripe_customer_id` lookup that
returned `betaProfile`/`checkoutProfile`/`updatedProfile`/`deletedProfile`/
`failedProfile`, or directly on `paidProfile.id` for the `invoice.paid`
combined select).

**Tenant key:** the resolved profile's `id` (= auth.uid).

### 1a. `checkout.session.completed` (beta tier) — lines ~224-232

Current:
```ts
const { data: betaFullProfile } = await supabase
  .from("profiles")
  .select("clinic_name")
  .eq("id", betaProfile.id)
  .maybeSingle()

void sendToGhl("subscription_active", {
  email: customerEmail,
  company: betaFullProfile?.clinic_name ?? null,
  ...
})
```

Replacement:
```ts
const betaFullProfile = await getProfile(supabase, betaProfile.id)

void sendToGhl("subscription_active", {
  email: customerEmail,
  company: betaFullProfile?.clinic_name ?? null,
  ...
})
```

### 1b. `checkout.session.completed` (standard tier) — lines ~331-339

Current:
```ts
const { data: subProfile } = await supabase
  .from("profiles")
  .select("clinic_name")
  .eq("id", checkoutProfile.id)
  .maybeSingle()

void sendToGhl("subscription_active", {
  ...
  company: subProfile?.clinic_name ?? null,
})
```

Replacement: same pattern - `await getProfile(supabase, checkoutProfile.id)`,
then read `.clinic_name`.

### 1c. `customer.subscription.deleted` — lines ~449-457

Current:
```ts
const { data: cancelProfile } = await supabase
  .from("profiles")
  .select("clinic_name")
  .eq("id", deletedProfile.id)
  .maybeSingle()
```

Replacement: `await getProfile(supabase, deletedProfile.id)`.

### 1d. `invoice.payment_failed` — lines ~509-517

Current:
```ts
const { data: failedFullProfile } = await supabase
  .from("profiles")
  .select("clinic_name")
  .eq("id", failedProfile.id)
  .maybeSingle()
```

Replacement: `await getProfile(supabase, failedProfile.id)`.

### 1e. `invoice.paid` — lines ~543-547, 569-571

The `invoice.paid` branch selects `clinic_name` directly on `paidProfile`
(combined select). The compound select needs to split into:
1. `await getProfile(supabase, paidProfile?.id)` — for clinic_name.
2. The existing `subscription_status` / `id` select stays.

OR rewrite the upper select to `"id, subscription_status"` and call
`getProfile` separately just before the GHL send.

Tenant key for all five: profile row's own `id`.

---

## 2. `app/auth/callback/route.ts`

### 2a. team_members invite acceptance — lines ~20-27

Current:
```ts
const { data: teamMember } = await adminClient
  .from("team_members")
  .select("email, invited_at")
  .eq("invite_token", inviteToken)
  .eq("accepted", false)
  .maybeSingle()

if (!teamMember || teamMember.email !== user.email) {
```

Replacement: use `acceptInvite` from `lib/repos/team-members.ts` (which
already exists). But the existing handler also enforces a 72-hour expiry
window, which is NOT in `acceptInvite`. So either:
- Extend `acceptInvite` to take an `expireHours` parameter (cleaner).
- Inline an `eq("invite_token", inviteToken)` + decrypt + expiry check
  using the repo's row decrypt helper:
  ```ts
  const { data: rawRow } = await adminClient
    .from("team_members")
    .select("id, profile_id, user_id, email_enc, email, role, " +
            "invite_token, accepted, accepted_at, invited_at")
    .eq("invite_token", inviteToken)
    .eq("accepted", false)
    .maybeSingle()
  if (!rawRow) { /* mismatch redirect */ }
  const teamMember = decryptTeamMemberRow(rawRow.profile_id, rawRow as TeamMemberEncryptedRow)
  if (teamMember.email !== user.email) { /* mismatch redirect */ }
  // existing 72hr expiry check on teamMember.invited_at
  // then await acceptInvite(adminClient, inviteToken, user.id)
  ```

**Tenant key:** `rawRow.profile_id` (the inviting owner's profile_id, which
is the `userId` for the `team_members.email` DEK).

### 2b. claimBetaPurchase — lines ~105-109, 144

Current:
```ts
const { data: existingProfile } = await serviceClient
  .from("profiles")
  .select("subscription_status, is_beta_subscriber, clinic_name")
  .eq("id", userId)
  .maybeSingle()
...
const clinicName = existingProfile?.clinic_name || "there"
```

Replacement:
```ts
const existingProfile = await getProfile(serviceClient, userId)
// existingProfile carries subscription_status, is_beta_subscriber,
// clinic_name decrypted under userId's DEK.
const clinicName = existingProfile?.clinic_name || "there"
```

**Tenant key:** `userId` (the user accepting the claim).

NOTE: this file ALSO reads `beta_purchases` by `email` (line 98) — that's
Phase 6 work (Wave 2C); leave the email lookup alone for now.

---

## 3. `app/api/admin/stats/route.ts`

### 3a. Recent Signups table — lines ~191-201

Current:
```ts
const { data: recentSignups } = await serviceClient
  .from("profiles")
  .select("id, clinic_name, subscription_status, created_at")
  .order("created_at", { ascending: false })
  .limit(10)

const signupsWithEmail = (recentSignups || []).map((signup) => ({
  ...signup,
  email: emailMap[signup.id] || "unknown",
}))
```

Replacement:
```ts
const recentSignups = await listProfilesForAdmin(serviceClient, { limit: 10 })

const signupsWithEmail = recentSignups.map((signup) => ({
  id: signup.id,
  clinic_name: signup.clinic_name,
  subscription_status: signup.subscription_status,
  created_at: signup.created_at,
  email: emailMap[signup.id] || "unknown",
}))
```

`listProfilesForAdmin` already iterates each row under its own user DEK
with the request-scoped derive cache (10 HKDFs for the whole call).

### 3b. signupActivity description — lines ~225-235

Uses the SAME `recentSignups` variable; the replacement above keeps the
shape compatible (clinic_name is decrypted at the list step).

**Tenant key:** each profile row's own `id`. Already handled inside
`listProfilesForAdmin`.

---

## Notes for the integration agent

- `app/api/admin/admins/route.ts` and `app/api/admin/admins/[id]/route.ts`
  appear in the Wave 2A task brief under "team_members" but they actually
  touch `platform_admins`, which is OUT OF SCOPE for v1 per plan §6.2 and
  §4. NO changes to those files in this wave.
- All five Stripe-webhook reads should share a single helper if they end
  up with identical shape:
  `const profileForGhl = await getProfile(supabase, id)`.
- After this integration pass lands, the only remaining profiles/team_members
  reads in the codebase should be inside the repo modules themselves and
  inside this `DEFERRED-WAVE2-A.md` history record.
