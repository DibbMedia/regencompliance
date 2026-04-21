# Adversarial probes — RegenCompliance

Browser-console smoke tests for the security hardening shipped in batch C + migrations 020/022.

Run each probe **as a normal (non-admin) logged-in user** against
`https://compliance.regenportal.com`. Each probe tells you what the expected
response is. Anything else is a regression.

---

## Setup (once per browser session)

Open the DevTools console on any page of the live site while logged in, then
paste the following block to expose a Supabase client bound to the logged-in
session. Everything below assumes `sb` is defined.

```js
// Load the Supabase JS client from a CDN into the console scope.
const { createClient } = await import(
  "https://esm.sh/@supabase/supabase-js@2"
);

// These two values are public (NEXT_PUBLIC_*) and shipped in the site bundle.
// Grab them by inspecting any network request to supabase — or hard-code
// them from your Vercel env snapshot.
const SUPABASE_URL = prompt("SUPABASE_URL?")
const SUPABASE_ANON = prompt("SUPABASE_ANON_KEY?")

const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// Restore the signed-in session so inserts/updates run with your user JWT.
const authStorage = Object.keys(localStorage).find((k) =>
  k.startsWith("sb-") && k.endsWith("-auth-token"),
);
if (!authStorage) throw new Error("Not logged in — log in before probing.");
const session = JSON.parse(localStorage.getItem(authStorage)).currentSession;
await sb.auth.setSession({
  access_token: session.access_token,
  refresh_token: session.refresh_token,
});

const { data: me } = await sb.auth.getUser();
console.log("Probing as:", me.user?.email, me.user?.id);
```

---

## Probe 1 — Paywall-bypass (profile privilege escalation)

**Trigger under test:** `profiles_field_guard` (migration 020).

**Setup:** logged-in user, any tier.

**Expected:** every mutation returns a PostgREST error whose message contains
`Protected profile field cannot be updated directly`. Status is 400 class.

**Fail condition:** any mutation returns `{ data: ..., error: null }`. That
would mean a user can self-grant an active subscription from the browser.

### 1a. subscription_status

```js
const r = await sb
  .from("profiles")
  .update({ subscription_status: "active" })
  .eq("id", me.user.id)
  .select();

console.log("subscription_status →", r);
console.assert(
  r.error &&
    r.error.message.includes("Protected profile field cannot be updated"),
  "❌ REGRESSION — subscription_status was writable by user",
);
```

### 1b. stripe_customer_id

```js
const r = await sb
  .from("profiles")
  .update({ stripe_customer_id: "cus_probe_" + Date.now() })
  .eq("id", me.user.id)
  .select();
console.log("stripe_customer_id →", r);
console.assert(
  r.error && r.error.message.includes("Protected profile field"),
  "❌ REGRESSION — stripe_customer_id was writable by user",
);
```

### 1c. stripe_subscription_id

```js
const r = await sb
  .from("profiles")
  .update({ stripe_subscription_id: "sub_probe_" + Date.now() })
  .eq("id", me.user.id)
  .select();
console.log("stripe_subscription_id →", r);
console.assert(
  r.error && r.error.message.includes("Protected profile field"),
  "❌ REGRESSION — stripe_subscription_id was writable by user",
);
```

### 1d. is_beta_subscriber

```js
const r = await sb
  .from("profiles")
  .update({ is_beta_subscriber: true })
  .eq("id", me.user.id)
  .select();
console.log("is_beta_subscriber →", r);
console.assert(
  r.error && r.error.message.includes("Protected profile field"),
  "❌ REGRESSION — is_beta_subscriber was writable by user",
);
```

### 1e. beta_enrolled_at

```js
const r = await sb
  .from("profiles")
  .update({ beta_enrolled_at: new Date().toISOString() })
  .eq("id", me.user.id)
  .select();
console.log("beta_enrolled_at →", r);
console.assert(
  r.error && r.error.message.includes("Protected profile field"),
  "❌ REGRESSION — beta_enrolled_at was writable by user",
);
```

### 1f. badge_id

```js
const r = await sb
  .from("profiles")
  .update({ badge_id: "badge_probe_" + Date.now() })
  .eq("id", me.user.id)
  .select();
console.log("badge_id →", r);
console.assert(
  r.error && r.error.message.includes("Protected profile field"),
  "❌ REGRESSION — badge_id was writable by user",
);
```

### 1g. control — writable field must still succeed

```js
const r = await sb
  .from("profiles")
  .update({ company_name: "Probe " + Date.now() })
  .eq("id", me.user.id)
  .select();
console.log("company_name (should succeed) →", r);
console.assert(!r.error, "❌ legitimate profile update is broken");
```

If 1a–1f all assert and 1g succeeds, migration 020 is live and effective.

---

## Probe 2 — Logos bucket cross-tenant upload (storage RLS)

**Policy under test:** `logos owner insert` / `logos owner update` /
`logos owner delete` (migration 022).

**Expected:** uploads to a path whose first segment is `me.user.id` succeed;
uploads to any other UUID's folder return a 403/storage-policy error.

**Fail condition:** an upload to `someone-else-uuid/*` succeeds.

### 2a. own-folder upload (should succeed)

```js
const ownPath = `${me.user.id}/probe-${Date.now()}.txt`;
const blob = new Blob(["probe"], { type: "text/plain" });
const r = await sb.storage.from("logos").upload(ownPath, blob, {
  upsert: true,
});
console.log("own-folder upload →", r);
console.assert(!r.error, "❌ own-folder upload failed — policy too strict");
```

### 2b. foreign-folder upload (should fail 403)

```js
// Use any UUID that is not yours. A random one is fine — the policy check
// happens before the row is written.
const foreignUuid = "00000000-0000-0000-0000-000000000001";
const foreignPath = `${foreignUuid}/probe-${Date.now()}.txt`;
const blob = new Blob(["probe"], { type: "text/plain" });
const r = await sb.storage.from("logos").upload(foreignPath, blob);
console.log("foreign-folder upload →", r);
console.assert(
  r.error && /policy|forbidden|403|row-level/i.test(r.error.message),
  "❌ REGRESSION — cross-tenant logo upload succeeded",
);
```

### 2c. public read (should succeed for anyone)

```js
const r = await sb.storage.from("logos").list(me.user.id);
console.log("own-folder list →", r);
console.assert(!r.error, "❌ public read of own folder failed");
```

### 2d. cleanup

```js
// Remove the probe file from your own folder so you don't accumulate litter.
const { data: files } = await sb.storage.from("logos").list(me.user.id);
const probes = (files ?? [])
  .filter((f) => f.name.startsWith("probe-"))
  .map((f) => `${me.user.id}/${f.name}`);
if (probes.length > 0) {
  const r = await sb.storage.from("logos").remove(probes);
  console.log("cleanup →", r);
}
```

---

## Probe 3 — Rate-limit namespacing (optional)

**Under test:** per-user-per-action-per-day rate-limit keys in
`lib/rate-limit.ts`. The fix ensures `scan-text-day:` and `scan-file-day:` use
distinct key prefixes, so hitting the text quota doesn't also kill file
uploads.

**Expected:** hitting the text-scan daily cap does not block a file or URL
scan.

Because this test consumes real quota and costs real tokens, only run it on a
throwaway account, and only if you actively suspect a regression.

```js
// Skipping: costs money. See lib/rate-limit.ts and the unit tests
// under tests/ for namespacing coverage instead.
```

---

## What "green" looks like

After running probes 1 and 2 as a normal user:

- 1a–1f: every `r.error` ends in "Protected profile field…". No `data` rows
  returned.
- 1g: `r.data` contains the updated `company_name` row.
- 2a: `r.data.path` matches `me.user.id/probe-<timestamp>.txt`.
- 2b: `r.error` mentions policy/RLS/forbidden.
- 2c: `r.data` lists your probe files.
- 2d: probe files removed.

Any other outcome is a regression — file it against the migration or the
route that took the write.
