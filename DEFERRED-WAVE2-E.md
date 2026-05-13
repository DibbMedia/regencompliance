# Wave 2E - Deferred edits

Wave 2E (Phase 6 leads encryption + reservation_token claim redesign)
shipped everything except the shared-file hotspots flagged in plan §12.9.
The main session merges these in once the wave lands.

All file paths are repo-relative.

---

## 1. `app/auth/callback/route.ts`

**Why deferred:** shared file (plan §12.9). Wave 2A (profiles) and Wave 2B
(team_members) both also touch this route. Merging in the same wave risks
collisions.

**What changes:**

Replace the entire `claimBetaPurchase(userId, email)` block (currently at
lines ~89-154) with a `claimBetaByCookieToken` block that reads the
`rc_beta_claim` cookie and calls
`claimByReservationToken(serviceClient, token, user.id)`.

Specifically:

1. Drop the `await claimBetaPurchase(user.id, user.email)` call at line ~65
   inside the `GET` handler.

2. Add this just before the `profiles.onboarding_complete` read (line ~70):

   ```ts
   // Beta reservation_token claim (plan §12.2). The login page set
   // rc_beta_claim from ?claim=<token> on the Stripe success_url. Read it
   // here (server-side cookie store), call the token-based repo claim, and
   // clear the cookie. Email-based claim is dead - beta_purchases.email is
   // encrypted ciphertext post-Phase 6.
   try {
     const cookieStore = await cookies()
     const claimToken = cookieStore.get("rc_beta_claim")?.value
     if (claimToken && isValidUUID(claimToken)) {
       const adminClient = createServiceClient()
       const result = await claimByReservationToken(adminClient, claimToken, user.id)
       if (result.claimed) {
         await adminClient
           .from("profiles")
           .update({
             subscription_status: "active",
             is_beta_subscriber: true,
             beta_enrolled_at: new Date().toISOString(),
             stripe_customer_id: result.row.stripe_customer_id,
           })
           .eq("id", user.id)

         await adminClient.from("notifications").insert({
           profile_id: user.id,
           title: "Beta Access Activated",
           body: "Your lifetime beta access to RegenCompliance is now active. Welcome aboard!",
           type: "billing",
           action_url: "/dashboard/scanner",
         })

         // GHL beta-activation event - mirrors the Stripe webhook path; dedup
         // at the workflow level via stripe_customer_id.
         const { data: betaProfile } = await adminClient
           .from("profiles")
           .select("clinic_name")
           .eq("id", user.id)
           .maybeSingle()
         void sendToGhl("subscription_active", {
           email: user.email ?? "",
           company: betaProfile?.clinic_name ?? null,
           tier: "beta",
           monthly_price_cents: 29700,
           subscription_status: "active",
           subscription_started_at: new Date().toISOString(),
           stripe_customer_id: result.row.stripe_customer_id ?? "",
         })
       }
     }
   } catch (err) {
     console.error("Beta claim by token failed:", err)
   } finally {
     // Clear the cookie regardless of outcome - either we claimed (success
     // path) or the claim failed (don't retry on every callback hit).
     try {
       const cookieStore = await cookies()
       cookieStore.delete("rc_beta_claim")
     } catch {}
   }
   ```

3. Drop the now-unused `claimBetaPurchase` function (lines ~89-154).

4. Add imports:

   ```ts
   import { cookies } from "next/headers"
   import { claimByReservationToken } from "@/lib/repos/beta-purchases"
   import { isValidUUID } from "@/lib/validations"
   ```

5. Drop unused imports: `sendToGhl` stays (still used by the new block).

**Replaces:** lines 95-100 (email-based `beta_purchases` lookup) and
lines 127-130 (email-based `beta_purchases.update` claim mark).

---

## 2. `app/api/stripe/webhook/route.ts`

**Why deferred:** shared file (plan §12.9 hotspot - touched by every
encryption wave). 4 profiles reads + 4 notifications inserts + 1 audit_log
insert + 3 beta_purchases updates make this the integration-pass file at
the end of every wave.

**What changes (Wave 2E scope only):**

### 2a. Line ~132-141: reservation_token row finalization

Existing code already keys off `reservation_token` for the optimistic
finalize, which is good. But it sets `email: customerEmail` on the
plaintext column - which after mig 042 doesn't exist. Replace:

```ts
// BEFORE
const { error: updErr } = await supabase
  .from("beta_purchases")
  .update({
    email: customerEmail,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
  })
  .eq("reservation_token", reservationToken)
  .eq("claimed", false)
```

With:

```ts
// AFTER - use the repo to encrypt email_enc, write stripe_customer_id +
// stripe_subscription_id (plaintext) directly via the repo's update path.
// stripe_subscription_id stays plaintext per plan §3.5 (webhook lookups
// require equality).
const id = randomUUID()
const email_enc = customerEmail
  ? encryptForRow({
      rowId: <existing row id>, // must SELECT id by reservation_token first
      plaintext: customerEmail,
      table: "beta_purchases",
      column: "email",
    })
  : null

const { error: updErr } = await supabase
  .from("beta_purchases")
  .update({
    email_enc,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
  })
  .eq("reservation_token", reservationToken)
  .eq("claimed", false)
```

Note: encryption AAD requires the row's `id`, so we need a prior `select id`
by reservation_token. Or refactor `beta_purchases` repo to expose an
`updateReservationByToken({ token, email, stripe_customer_id, ... })`
helper that does the SELECT + encrypt + UPDATE in one call.
**Recommended:** add the helper to `lib/repos/beta-purchases.ts`.

### 2b. Line ~145-150: legacy/no-token fallback insert

```ts
// BEFORE
await supabase.from("beta_purchases").insert({
  email: customerEmail,
  stripe_customer_id: customerId,
  stripe_subscription_id: subscriptionId,
})
```

After mig 042 the plaintext `email` column is gone. Switch to:

```ts
// AFTER
await createBetaPurchaseReservation(supabase, {
  email: customerEmail,
  stripe_customer_id: customerId,
  reservation_token: randomUUID(), // synthetic; no reserve_beta_seat path
}).catch((err) => console.error("[Stripe Webhook] Fallback insert failed:", err))
// Note: this no longer carries stripe_subscription_id - the existing repo
// API doesn't accept it. Extend BetaPurchaseReservationWrite to accept
// `stripe_subscription_id?: string | null`.
```

### 2c. Line ~200-207: legacy email+customer claim mark

```ts
// BEFORE (legacy fallback when reservationToken is null)
await supabase
  .from("beta_purchases")
  .update({ claimed: true, claimed_by: betaProfile.id })
  .eq("email", customerEmail)
  .eq("stripe_customer_id", customerId)
  .eq("claimed", false)
```

`email` column is dropped after mig 042 - the `.eq("email", customerEmail)`
filter will raise. Replace the legacy branch with:

```ts
// AFTER - stripe_customer_id is unique post mig 009 + sufficient on its own.
await supabase
  .from("beta_purchases")
  .update({ claimed: true, claimed_by: betaProfile.id })
  .eq("stripe_customer_id", customerId)
  .eq("claimed", false)
```

### 2d. Line ~225 (the GHL "subscription_active" event): no edit needed

The webhook reads `customerEmail` from Stripe's `fullSession.customer_details`,
not from `beta_purchases`. That path is unaffected by encryption.

### 2e. Lines 226-232 area: `profiles.clinic_name` read

**NOT WAVE 2E SCOPE.** Wave 2A (profiles encryption) owns the
`profiles.clinic_name` read. Listed only because it lives in the same
switch case.

---

## Integration order (recommended)

1. Land Wave 2E (this branch).
2. Merge Wave 2A + Wave 2B (profiles + team_members).
3. Main session integrates `/auth/callback/route.ts` and
   `/api/stripe/webhook/route.ts` with the deferred edits above.
4. Run `scripts/backfill-leads.ts` (Wave 2E).
5. Apply migration 042 (drops plaintext lead columns).
6. Soak 24h, then proceed to Wave 3 (scans).
