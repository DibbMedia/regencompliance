# Wave 2C — Deferred callsite migrations

Wave 2C swapped all notifications + tickets read/write to the encrypted repos
EXCEPT for the four callers below. They are deferred to the main-session
integration pass because they live in files owned by other parallel waves
(2B, 2E) or because they touch shared hotspots (`stripe/webhook`). Editing
them here would create unrecoverable merge conflicts.

Each entry shows the exact replacement. The shape is identical: replace the
direct `supabase.from("notifications").insert({...})` with a
`await createNotification(supabase, profileId, { title, body, type, action_url })`
call (import from `@/lib/repos/notifications`). The `profile_id` field on the
old shape becomes the second positional argument; the remaining fields move
into the input object.

## 1. `app/api/stripe/webhook/route.ts` (4 inserts)

Shared-file hotspot per plan §12.9. The webhook is also touched by Wave 2A
(profiles), 2D (beta_purchases + audit_log). Defer all four to the main-session
integrator.

### Insert at line ~210 ("Beta Access Activated")

Replace:
```ts
await supabase.from("notifications").insert({
  profile_id: betaProfile.id,
  title: "Beta Access Activated",
  body: "Your beta subscription to RegenCompliance is now active at the locked-in rate of $297/mo. Welcome aboard!",
  type: "billing",
  action_url: "/dashboard/scanner",
})
```
With:
```ts
await createNotification(supabase, betaProfile.id, {
  title: "Beta Access Activated",
  body: "Your beta subscription to RegenCompliance is now active at the locked-in rate of $297/mo. Welcome aboard!",
  type: "billing",
  action_url: "/dashboard/scanner",
})
```

### Insert at line ~318 ("Subscription Active")

Replace:
```ts
await supabase.from("notifications").insert({
  profile_id: checkoutProfile.id,
  title: "Subscription Active",
  body: "Your RegenCompliance subscription is now active. Start scanning your marketing content!",
  type: "billing",
  action_url: "/dashboard/scanner",
})
```
With:
```ts
await createNotification(supabase, checkoutProfile.id, {
  title: "Subscription Active",
  body: "Your RegenCompliance subscription is now active. Start scanning your marketing content!",
  type: "billing",
  action_url: "/dashboard/scanner",
})
```

### Insert at line ~437 ("Subscription Cancelled")

Replace:
```ts
await supabase.from("notifications").insert({
  profile_id: deletedProfile.id,
  title: "Subscription Cancelled",
  body: "Your subscription has been cancelled. You can resubscribe anytime from your account page.",
  type: "billing",
  action_url: "/dashboard/account",
})
```
With:
```ts
await createNotification(supabase, deletedProfile.id, {
  title: "Subscription Cancelled",
  body: "Your subscription has been cancelled. You can resubscribe anytime from your account page.",
  type: "billing",
  action_url: "/dashboard/account",
})
```

### Insert at line ~496 ("Payment Failed")

Replace:
```ts
await supabase.from("notifications").insert({
  profile_id: failedProfile.id,
  title: "Payment Failed",
  body: "Your latest payment failed. Please update your payment method to keep your subscription active.",
  type: "billing",
  action_url: "/dashboard/account",
})
```
With:
```ts
await createNotification(supabase, failedProfile.id, {
  title: "Payment Failed",
  body: "Your latest payment failed. Please update your payment method to keep your subscription active.",
  type: "billing",
  action_url: "/dashboard/account",
})
```

Required import at top of file:
```ts
import { createNotification } from "@/lib/repos/notifications"
```

## 2. `app/api/sites/[id]/scan/route.ts` (Wave 2B-owned)

This file is owned by Wave 2B for the scan/site_pages encryption work. There
is one `createUserNotification(...)` call at line ~97 that does NOT need an
edit because `lib/notifications.ts` was already rewritten in Wave 2C to be a
thin encrypted-repo adapter. The signature is unchanged. Wave 2B's edits to
this file can co-exist with the existing import.

No action required - just verify the import line still reads:
```ts
import { createUserNotification } from "@/lib/notifications"
```
after the Wave 2B merge.

## 3. `app/api/sites/[id]/crawl/route.ts` (Wave 2B-owned)

Same situation as scan/route.ts. The existing `createUserNotification` call
at line ~91 routes through the rewritten adapter and writes encrypted rows
automatically. No edit needed in this wave. Verify the import survives the
Wave 2B merge.

## 4. `app/api/beta/claim/route.ts` (Wave 2E-owned)

Direct insert at line ~45:
```ts
await serviceClient.from("notifications").insert({
  profile_id: ...,
  title: "...",
  body: "...",
  type: "...",
  action_url: "...",
})
```
Replace with:
```ts
await createNotification(serviceClient, profileId, {
  title: "...",
  body: "...",
  type: "...",
  action_url: "...",
})
```

Wave 2E owns this file for the `reservation_token` redesign. Apply this swap
in the same edit pass.

Required import:
```ts
import { createNotification } from "@/lib/repos/notifications"
```

## 5. `app/auth/callback/route.ts` (also writes notifications)

Found a fifth notification insert at line ~132 (not in the original task spec
but flagged during the Wave 2C sweep). Defer to whichever wave touches the
auth callback. Same swap pattern as above:
```ts
import { createNotification } from "@/lib/repos/notifications"
// ...
await createNotification(serviceClient, profileId, { title, body, type, action_url })
```
