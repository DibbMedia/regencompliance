---
phase: 2026-05-20-security-wave
reviewed: 2026-05-20T12:00:00Z
depth: standard
diff_base: 34a4368
files_reviewed: 31
files_reviewed_list:
  - .github/workflows/tests.yml
  - app/api/admin/impersonate/route.ts
  - app/api/admin/step-up/route.ts
  - app/api/admin/users/[id]/route.ts
  - app/api/beta-apply/route.ts
  - app/api/demo/scan/route.ts
  - app/api/free-audit/route.ts
  - app/api/scan-file/route.ts
  - app/api/scan-url/route.ts
  - app/api/scan/route.ts
  - app/api/waitlist/route.ts
  - app/apply/apply-form.tsx
  - app/free-audit/free-audit-form.tsx
  - app/waitlist/page.tsx
  - components/cookie-consent.tsx
  - lib/admin/justification.ts
  - lib/admin/step-up.ts
  - lib/env.ts
  - lib/phi-filter.ts
  - lib/repos/audit-log.ts
  - lib/scan/run-site-crawl.ts
  - lib/security/ip-allowlist.ts
  - lib/validations.ts
  - proxy.ts
  - scripts/verify-audit-chain.ts
  - supabase/migrations/044_audit_log_hash_chain.sql
  - tests/integration/cookie-hardening.test.ts
  - tests/integration/csp-headers.test.ts
  - tests/lib/admin/justification.test.ts
  - tests/lib/admin/step-up.test.ts
  - tests/lib/phi-filter.test.ts
  - tests/lib/repos/audit-log-chain.test.ts
  - tests/lib/security/ip-allowlist.test.ts
findings:
  critical: 2
  warning: 9
  info: 7
  total: 18
status: issues_found
---

# Security Wave Code Review

**Reviewed:** 2026-05-20
**Depth:** standard
**Files Reviewed:** 31
**Status:** issues_found

## Summary

The wave landed substantive security work - hash-chained audit log, output-side PHI scrubbing, admin justification + step-up gating, IP allowlist, honeypots, cookie hardening tests, and CSP regression locking. Most of it is well-engineered: the chain math is sound, the PHI redactor is idempotent and correctly avoids re-leaking values into logs, the cookie hardening test catches the documented regression patterns, and the impersonate / users-delete routes wire the step-up + justification gates correctly.

However, the adversarial pass surfaced two BLOCKER-tier issues plus a cluster of subtle defense-in-depth gaps. The most consequential: `DELETE /api/admin/admins/[id]` (removes other platform admins) is structurally identical to `DELETE /api/admin/users/[id]` but landed WITHOUT a step-up gate or a justification gate, because the wave touched only the two routes named in the plan. Second, the step-up cookie's HMAC binds to the user-id claimed inside the cookie payload but never compares that user-id to the currently authenticated `auth.user.id` - if a step-up cookie ever leaks (XSS on /admin pages, log-paste in support, cookie sync error in a shared-browser admin workstation), another logged-in admin can use it. Third, the rate limit on `/api/admin/step-up` is per-IP but the IP source falls back to the rightmost XFF entry on non-Vercel hosts, which collapses every admin's brute-force budget into a single shared bucket - and is similarly attacker-controllable through XFF spoofing if the deployment ever moves off Vercel.

Beyond those, the PATCH path on `users/[id]` (changes subscription_status / is_beta_subscriber - billing impact) has no step-up; the apply form references a response field the route never returns; the free-audit honeypot logs `console.info` with the IP but no signal-leak risk; the demo cookie HMAC silently falls back to `""` when all three secret envs are absent; the IP allowlist soft-fails malformed entries without alerting the operator at boot.

The hash chain, PHI filter, justification helper, and IP allowlist all have strong test coverage. Test-level concerns are limited to: the CSP test's allowlist is path-based brittle (already flagged as a tradeoff in the source); the chain test exercises math but doesn't exercise the race-fork case that the doc-comment admits to (would be a meaningful integration test).

## Critical Issues

### CR-01: `DELETE /api/admin/admins/[id]` is missing step-up + justification gates

**File:** `app/api/admin/admins/[id]:52-115`

**Issue:** The wave applied step-up + justification gates to `DELETE /api/admin/users/[id]` (regular user deletion) and POST `/api/admin/impersonate` (impersonation start) on the basis that "deletion is the most destructive admin op." Removing another platform admin from the `platform_admins` table is at least as destructive: it strips admin access from another operator, cleans up their impersonation sessions, and produces no recovery path other than a manual DB INSERT. The DELETE handler here does verifyDeveloperAdmin and a "cannot remove yourself" check, but no step-up cookie verification and no justification capture. A leaked admin session (the exact threat model the step-up cookie was built for) can therefore demote every other admin to a non-admin role with one DELETE call, none of which require the destructive-op re-auth that user-deletion does.

This was almost certainly an oversight - the wave plan named the two routes (impersonate-start, user-delete) and the agent gated those only. The fix is mechanical: import `hasFreshStepUp`/`stepUpRequired` and `extractJustification`, apply them at the top of the DELETE handler, fold the justification into `logAudit({ details: ... })`.

**Fix:**
```typescript
// app/api/admin/admins/[id]/route.ts
import { hasFreshStepUp, stepUpRequired } from "@/lib/admin/step-up"
import { extractJustification } from "@/lib/admin/justification"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifyDeveloperAdmin()
  if ("error" in auth) return auth.error
  const { user, serviceClient } = auth

  // Step-up gate: removing another admin is destructive.
  if (!(await hasFreshStepUp(request))) {
    const r = stepUpRequired()
    return NextResponse.json(r.body, { status: r.status })
  }

  // Justification gate.
  const body = await request.json().catch(() => null)
  const justCheck = extractJustification(body)
  if (!justCheck.ok) {
    return NextResponse.json(justCheck.error!.body, { status: justCheck.error!.status })
  }
  const justification = justCheck.justification!

  // ...rest of the handler unchanged, plus fold justification into details
  logAudit({
    // ...
    details: { email: row.email, justification },
    // ...
  })
}
```

While there, audit `PATCH /api/admin/admins/[id]` (line 7-50 same file) - it promotes/demotes admin roles (developer <-> support). Probably should gate the same way, since promoting "support" to "developer" gives write-impersonation + delete-user power. At minimum, justification.

---

### CR-02: Admin step-up rate-limit IP source silently collapses to a shared bucket on non-Vercel hosts

**File:** `app/api/admin/step-up/route.ts:45,49`

**Issue:** Line 45 calls `getClientIp(request)` from `lib/ip.ts`. That helper checks `x-vercel-forwarded-for` first (leftmost - which on Vercel production is the real client - correct), but if that header is missing falls through to `x-forwarded-for` and returns the **rightmost** entry (line 7 of lib/ip.ts: `parts[parts.length - 1]`). The rightmost of XFF is the closest proxy hop. On Vercel production this branch never fires because Vercel sets `x-vercel-forwarded-for`. But:

1. **Local dev / docker / non-Vercel preview:** No `x-vercel-forwarded-for`, so every request shares the rate-limit key derived from the closest-proxy IP (often a single load-balancer or "unknown"). Five wrong passwords from ANY admin lock out ALL admins for a minute. This is a DoS vector.

2. **XFF spoofing on non-Vercel hosts:** An unauthenticated attacker who learns the route exists can send `X-Forwarded-For: spoofed-ip` and rotate that header per request - the rightmost choice means the proxy's appended entry is what's counted, but the attacker doesn't care about their own bucket; the attacker can lock out the legitimate admin by exhausting the global "rightmost-IP" bucket. The proxy IP can also be predictable from public DNS, making targeted exhaustion easier.

3. **Real defense-in-depth concern even on Vercel:** If Vercel ever changes the `x-vercel-forwarded-for` semantics (they have changed XFF header conventions in the past), the route silently falls back to the unsafe rightmost-XFF logic. There is no boot-time check that the chosen header is present.

Per the focus area in the prompt ("Is the password re-verification rate-limited per IP AND per account?"), the answer is per-IP only, and even the per-IP key is wrong on non-Vercel hosts. Supabase Auth's own per-account lockout mitigates the brute-force angle, but the DoS / cross-admin lockout angle is unmitigated.

**Fix:** Make the step-up route call `getAdminGateClientIp(request)` from `proxy.ts` (or factor that helper into `lib/ip.ts` as `getClientIpStrict()`) which uses LEFTMOST XFF semantics. Then add a per-account rate-limit alongside the per-IP one:

```typescript
import { NextRequest } from "next/server"

function getStepUpClientIp(request: Request): string {
  const vercel = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
  if (vercel) return vercel
  const xff = request.headers.get("x-forwarded-for")
  if (xff) {
    // LEFTMOST is the originating client per RFC 7239. Rightmost is the
    // closest proxy and collapses to a shared bucket.
    const first = xff.split(",")[0]?.trim()
    if (first) return first
  }
  const real = request.headers.get("x-real-ip")
  if (real) return real.trim()
  return "unknown"
}

// In POST:
const clientIp = getStepUpClientIp(request)

// 1a. Per-IP cap (existing).
const ipLimit = await checkRateLimit(`admin-step-up-ip:${clientIp}`, 5, 60 * 1000)
if (!ipLimit.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

// 1b. Per-user cap. Runs AFTER verifyAdmin so we have user.id.
// (move this below verifyAdmin)
const userLimit = await checkRateLimit(`admin-step-up-user:${user.id}`, 10, 5 * 60 * 1000)
if (!userLimit.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 })
```

The per-account cap is best at 5-10 / 5min so a fat-fingered admin doesn't lock themselves out for too long, but a real brute-force attempt is throttled.

---

## Warnings

### WR-01: Step-up cookie does not bind to the currently-authenticated user

**File:** `lib/admin/step-up.ts:127-161`, `app/api/admin/impersonate/route.ts:33-37`, `app/api/admin/users/[id]/route.ts:75-79`

**Issue:** `hasFreshStepUp(request)` decodes the cookie, splits into `userId.ts.sig`, validates the HMAC matches `HMAC(secret, "${userId}.${ts}")`, and checks the timestamp. It then returns true/false based solely on whether the cookie is a well-formed, fresh, secret-signed envelope. **It does not check that the `userId` inside the cookie matches the currently authenticated user.**

Callers (impersonate route, users delete route) then just `if (!(await hasFreshStepUp(request)))` without passing `auth.user.id`. So:

- If Admin A's step-up cookie leaks somehow (XSS bypassing SameSite=Strict via subdomain attack, debugger paste, shared workstation in admin support office) and Admin B's browser somehow ends up with it (cookie sync misconfiguration on a corp browser, manual copy-paste into devtools by an attacker who has Admin B's screen), Admin B can use it to bypass the step-up check.
- More realistically: if the HMAC secret ever leaks (which is currently `ENCRYPTION_KEY_V1.slice(0, 32)` by fallback - shared with the master encryption key shape, and the secret is loaded fresh on every HMAC compute so a key-rotation script that briefly mis-sets it is observable), an attacker can mint a step-up cookie for ANY userId and use it from any admin session.

Defense in depth: bind the cookie to the userId. The Path=/api/admin + HttpOnly + SameSite=Strict closes the obvious browser-side leak vectors, so this is "Warning" not "BLOCKER", but it is a free hardening with no UX cost.

**Fix:** Change `hasFreshStepUp` to accept an `expectedUserId` argument and assert it matches the decoded payload:

```typescript
export async function hasFreshStepUp(
  request: Request,
  expectedUserId: string,
): Promise<boolean> {
  try {
    // ...existing decode + HMAC verify + TTL check...
    if (userId !== expectedUserId) return false
    return true
  } catch {
    return false
  }
}

// Then in callers:
if (!(await hasFreshStepUp(request, auth.user.id))) {
  const r = stepUpRequired()
  return NextResponse.json(r.body, { status: r.status })
}
```

The signed cookie value still tolerates a user-id-of-the-issuer mismatch from the request-authenticated user, with timingSafeEqual on the HMAC comparison; that's already correct.

---

### WR-02: `PATCH /api/admin/users/[id]` modifies billing fields without step-up

**File:** `app/api/admin/users/[id]:11-64`

**Issue:** The PATCH handler updates `subscription_status` (active, inactive, past_due, cancelled) and `is_beta_subscriber` on a user's profile. The DELETE handler on the same path was correctly identified as destructive and got the step-up gate. PATCH is less destructive but still high-impact:

- Setting `subscription_status: "active"` on an unpaid account grants paid-tier access (Anthropic API spend on demand, decryption of any encrypted columns the user holds).
- Setting `is_beta_subscriber: true` grants founder-tier pricing locked for life ($297/mo vs $497/mo).
- These changes are auditable but reversible only by manual intervention - and during the gap, a malicious actor can use the elevated session to run scans, drain rate limits, exfiltrate data through normal SaaS surfaces.

A stolen admin session that lasts 8 hours (Supabase Auth default) can grant or revoke billing status across the entire customer base.

**Fix:** Apply the step-up + justification gates to PATCH as well:

```typescript
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifyDeveloperAdmin()
  if ("error" in auth) return auth.error

  if (!(await hasFreshStepUp(request))) {
    const r = stepUpRequired()
    return NextResponse.json(r.body, { status: r.status })
  }

  // ...existing body parse...

  const justCheck = extractJustification(body)
  if (!justCheck.ok) {
    return NextResponse.json(justCheck.error!.body, { status: justCheck.error!.status })
  }
  // ...rest unchanged, fold justification into audit details...
}
```

---

### WR-03: `lib/env.ts` does not validate `ADMIN_ALLOWED_IPS` at boot

**File:** `lib/env.ts:79-83`, `lib/security/ip-allowlist.ts:248-271`

**Issue:** Env validation models `ADMIN_ALLOWED_IPS` as `z.string().optional()` - no shape check. The doc comment explicitly says: "a typo in one entry doesn't fail the entire env-validation step at boot." The runtime parser then soft-fails each malformed entry with `console.warn` and continues. The combined effect is that an operator can typo their static egress IP, deploy to production, and not notice until the next time they try to log in from that IP - at which point the gate denies them silently and they can't tell whether it's the typo, the deployment, or the source IP.

For a security control where the cost of a typo is "admins locked out of production" or worse "admins NOT locked out who should be" (different typo in a different position), boot-time validation is the right design.

**Fix:** Either tighten the env schema to refuse malformed entries:

```typescript
ADMIN_ALLOWED_IPS: z
  .string()
  .optional()
  .superRefine((v, ctx) => {
    if (v === undefined) return
    const matcher = parseAllowedIps(v)
    // parseAllowedIps soft-fails. We re-derive the rejected list here by
    // splitting and validating each entry manually.
    for (const part of v.split(",")) {
      const cleaned = part.trim()
      if (cleaned === "") continue
      if (parseEntry(cleaned) === null) {  // export parseEntry from ip-allowlist
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ADMIN_ALLOWED_IPS"],
          message: `Malformed entry: ${JSON.stringify(cleaned)}`,
        })
      }
    }
  }),
```

Or - simpler - have `parseAllowedIps` return both the matcher AND a list of skipped entries, and log them at module-init time with WARN-level so they show up on the first cold start regardless of whether anyone has tried to log in yet.

---

### WR-04: `getClientIp` returns rightmost XFF entry, which is wrong for every security-relevant use

**File:** `lib/ip.ts:1-12`

**Issue:** The fallback path on line 7 returns `parts[parts.length - 1]` - the rightmost entry of `x-forwarded-for`. RFC 7239 (the standard XFF semantics) defines the LEFTMOST entry as the originating client, with each downstream proxy APPENDING its own IP on the right. So the rightmost is the closest proxy to the application, not the originator.

This function is used by:
- `lib/audit-log.ts` (lines 109-114) - audit log IP attribution
- `app/api/admin/step-up/route.ts` line 45 - step-up rate-limit key (see CR-02)
- Every rate-limited public route (waitlist, beta-apply, free-audit, scan-file, scan-url, scan, demo/scan)
- Anywhere else that imports `getClientIp` from `@/lib/ip`

On Vercel production, `x-vercel-forwarded-for` is checked first (leftmost - correct), so production is fine. But every other deployment surface (local dev with vercel dev behind a proxy, vercel preview deploys behind a corporate proxy, docker-compose, any non-Vercel host) silently uses the wrong IP for rate-limiting AND for audit-log attribution.

**Fix:** Reverse the XFF semantics to leftmost, matching `getAdminGateClientIp` in proxy.ts:

```typescript
export function getClientIp(request: Request): string {
  const vercel = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
  if (vercel) return vercel
  const xff = request.headers.get("x-forwarded-for")
  if (xff) {
    // LEFTMOST is the originating client per RFC 7239. The Vercel-managed
    // proxy chain always presents the real client as leftmost; the rightmost
    // is the closest proxy hop which would collapse every external client
    // into a shared rate-limit bucket.
    const first = xff.split(",")[0]?.trim()
    if (first) return first
  }
  const real = request.headers.get("x-real-ip")
  if (real) return real.trim()
  return "unknown"
}
```

If there is a deliberate reason for rightmost (e.g., trust only the closest proxy and assume the leftmost is unsanitized user input), document it inline with the deployment topology that makes that valid - then audit which callers should use which variant.

---

### WR-05: Demo cookie HMAC secret silently degenerates to empty string if no envs are set

**File:** `app/api/demo/scan/route.ts:31-38`

**Issue:** `demoSecret()` reads three env vars in fallback order and returns `""` if none are set:

```typescript
return (
  process.env.DEMO_COOKIE_SECRET?.trim() ||
  process.env.NEXTAUTH_SECRET?.trim() ||
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  ""
)
```

When the secret is `""`, `createHmac("sha256", "")` is still valid (HMAC with empty key produces deterministic output). Both signing and verification use the same empty key, so the cookie ROUNDTRIPS - but the HMAC provides ZERO authentication. Any attacker who knows the cookie format can mint a "valid" cookie. Effectively the demo limit (3 scans / 90 days) becomes "0 scans" for an attacker who can re-encode the cookie themselves.

The fallback to `SUPABASE_SERVICE_ROLE_KEY` is itself a hygiene concern: using the service-role key as an HMAC seed in a publicly-reachable endpoint creates a side-channel that, while not theoretically reversible for HMAC-SHA256, gives an attacker observable output derived from a high-value secret. If the codebase ever exposes the secret to a logging surface or a future side-channel attack on HMAC implementation lands, that exposure has more impact than necessary.

Also note: per the CLAUDE.md context block ("Optional: set DEMO_COOKIE_SECRET in Vercel (currently falls back to NEXTAUTH_SECRET / SUPABASE_SERVICE_ROLE_KEY)"), the operator-side env hasn't been set yet, so production is currently running on the SUPABASE_SERVICE_ROLE_KEY fallback.

**Fix:** Fail closed when no secret is available:

```typescript
function demoSecret(): string {
  const s =
    process.env.DEMO_COOKIE_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim()
  if (!s || s.length < 16) {
    throw new Error(
      "Demo cookie HMAC secret missing. Set DEMO_COOKIE_SECRET (preferred, openssl rand -hex 32) " +
      "or NEXTAUTH_SECRET in the deployment env.",
    )
  }
  return s
}
```

Drop the `SUPABASE_SERVICE_ROLE_KEY` fallback entirely - it's not the right key shape for this purpose and bleeds a service-tier secret into a publicly-derived HMAC output. Then have the demo route catch the thrown error at top-level and respond 503 - same response shape as today, just with a clearer error in logs.

---

### WR-06: PHI output redactor cannot redact unlabelled values

**File:** `lib/phi-filter.ts:73-98`, `app/api/scan-url/route.ts:217-227`, `app/api/free-audit/route.ts:254-270`

**Issue:** This is exactly the focus-area gap the prompt named, and it is a real exploit surface worth flagging explicitly. The output-side redactor's value patterns require a LABEL prefix ("DOB:", "MRN:", "Patient Name:", "Phone:") before they engage. The only unlabelled pattern is `SSN` (a free-floating `\d{3}-\d{2}-\d{4}\b`).

An attacker controlling a website (the target of `/api/free-audit` or `/api/scan-url`) can craft page content like: "John Smith was born on 03/14/1962 and is patient #0042913" - no labels, so Claude's quoted-back `matched_text` and `context` would carry the date and the patient number through unredacted. Or pure unlabelled birthdate: "Born 1962-03-14 in Topeka." No label, no redaction. The encrypted scans row would persist the PHI, and the API response would return it to a logged-in user (or in free-audit's case, an anonymous attacker who initiated the scan).

The PHI input-gate's design (labels required) is documented as deliberate to avoid false-positive blocks on legitimate marketing copy. The OUTPUT side does not have the same false-positive cost - if we redact a wrongly-flagged date in a quoted snippet, the user just sees "[REDACTED-DOB]" in a flag they'd be safely ignoring anyway, and the original flag still surfaces. So the symmetric "labels required" choice on the output side is wrong.

**Severity:** Warning rather than BLOCKER because: (a) the per-route input gate already blocks the obvious attacks, (b) the database row is encrypted at rest under the user's DEK so the PHI doesn't leak to a generic database compromise, (c) the response audience is the requester themselves in most paths. But for `/api/free-audit` the requester is an anonymous prospect who might pass their report to a third party, and for site-crawl scans the bandwidth of the leak is higher (many pages, many testimonials).

**Fix:** Add value-shape patterns for the unlabelled output side:

```typescript
const PHI_REDACT_PATTERNS_VALUE_ONLY: Array<{ name: string; re: RegExp }> = [
  // Date-shaped tokens that look like a birthdate (year within 1900-2025).
  // Cheap heuristic; will false-positive on a date in a calendar event,
  // which is acceptable in flagged compliance-violation snippets.
  { name: "DOB-value", re: /\b(?:0?[1-9]|1[012])[\/\-.](?:0?[1-9]|[12]\d|3[01])[\/\-.](?:19\d{2}|20[01]\d|202[0-5])\b/g },
  { name: "DOB-value-iso", re: /\b(?:19\d{2}|20[01]\d|202[0-5])-(?:0?[1-9]|1[012])-(?:0?[1-9]|[12]\d|3[01])\b/g },
  // 10-digit "patient #" / "MRN" / "ID" - integer with 5-12 digits in proximity to "patient"
  // (already handled by the labelled pattern; skip).
  // E.164 phone (more aggressive than the labelled pattern):
  { name: "Phone-value", re: /\b\(?[2-9]\d{2}\)?[\s\-.]\d{3}[\s\-.]\d{4}\b/g },
]
```

Append these to `PHI_REDACT_PATTERNS` and the existing scrubber will pick them up. Add unit tests for: "Born 1962-03-14", "John Smith (555) 123-4567", "patient #0042913 attended on 03/14/1962." Verify no false-positives on the marketing-copy fixture you already have.

---

### WR-07: Honeypot accepts any non-empty string but the schema marks it `optional()` with no max-length

**File:** `lib/validations.ts:26,70,104`, `app/api/waitlist/route.ts:52-58`, `app/api/beta-apply/route.ts:42-49`, `app/api/free-audit/route.ts:98-105`

**Issue:** The honeypot field `website_url2` is `z.string().optional()` in every schema - no max length, no shape validation. The route-handler honeypot gate runs BEFORE `safeParse`, but the gate only checks `typeof === "string" && !== ""`. If a bot fills the field with a multi-megabyte payload, the route does the right thing (silent 200, no further processing) but the `console.info("[honeypot] dropped...")` log fires - in your runtime logs this is a small amount of overhead, but a determined bot can use this to amplify your log volume cheaply.

More important: the comment on line 51 of waitlist/route.ts says "Never log the value itself - operators have injected XSS / log-poisoning payloads here." Good. But the log line `console.info("[honeypot] dropped waitlist submission with non-empty website_url2")` includes no value. The agent followed the rule. Verified.

The remaining concern: the schema's `z.string().optional()` with no `.max()` would still let `betaApplicationSchema.safeParse` pass on a multi-megabyte string IF the honeypot value were ever an empty string (which means the gate doesn't fire). Empty-string is the legitimate path. So this is more of a defense-in-depth note: cap the field at a small length to prevent the JSON parse from being a memory pressure vector if the bot sends a huge empty-string-or-not value.

**Fix:** Constrain the schema:

```typescript
website_url2: z.string().max(200).optional(),
```

In `waitlistSchema`, `betaApplicationSchema`, `freeAuditSchema`. 200 is plenty - a real URL or any URL-looking thing fits, and bots that fill it with multi-kilobyte payloads get caught by the zod check (which the route handler bypasses via early honeypot return, but the parse cost is bounded).

Also: in all three route handlers, the order is honeypot-gate first (good - bot doesn't burn LLM budget) then schema parse. Verified.

---

### WR-08: Site-crawl PHI scrub runs AFTER content is already in the LLM prompt

**File:** `lib/scan/run-site-crawl.ts:233-244,302-313`

**Issue:** The site-crawl loop (used by cron + manual scans) does NOT run `detectPhi` on the scraped page content before sending to Claude. The output-side redactor runs on Claude's response after the call. This is documented inline as a deliberate "no input gate on site crawls" choice. Comments say: "Site crawls are the highest-risk surface because the page content was never vetted by detectPhi."

So if a clinic's testimonial page contains a labeled PHI block ("Patient Name: Jane Doe, DOB: 03/14/1962, MRN: 0042913"), the full string is sent to Anthropic's API. Anthropic gets a copy, even though the response is then scrubbed before persistence. This means:

- The PHI transits via the API call to Anthropic in plaintext (over TLS, but still leaves the perimeter).
- If Anthropic logs or fine-tunes on customer data, the PHI is in scope.
- The clinic's BAA (if any) with Anthropic must cover this. Many clinics have BAAs only with their EHR vendor, not their marketing tools.

**Severity:** This is a real HIPAA-adjacent concern. Status: Warning because (a) the customer expressly opted into a compliance scan of their own page content; the page is THEIR responsibility to scrub before publishing, (b) Anthropic does have a BAA available for enterprise customers and the RegenCompliance team controls whether they're on it. But this should be either input-gated like the standalone routes OR documented explicitly in the privacy / data-handling policy with a "we will send your page text to Anthropic, do not include patient records on the pages you ask us to scan."

**Fix:** Add the input gate to the site-crawl loop:

```typescript
// In scanSitePages, immediately after extractPageContentWithStatus:
if (extractResult.ok) {
  const inputPhi = detectPhi(content.text)
  if (inputPhi.detected) {
    console.warn(
      `[${source}] PHI detected in page ${page.url}, blocking scan: ${inputPhi.patterns.join(", ")}`,
    )
    await supabase
      .from("site_pages")
      .update({
        status: "blocked_phi",
        last_error: `PHI patterns detected: ${inputPhi.patterns.join(", ")}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", page.id)
    failedCount++
    continue
  }
}
```

Either that, or document in the operator-facing copy AND the customer-facing privacy page that pages with PHI labels will be sent to the LLM. The current behavior is silent.

---

### WR-09: Audit chain race-fork is documented but not tested

**File:** `lib/repos/audit-log.ts:437-466`, `supabase/migrations/044_audit_log_hash_chain.sql:37-44`, `tests/lib/repos/audit-log-chain.test.ts`

**Issue:** The hash chain has a documented race-fork condition: two near-concurrent inserts both read the same `prev_hash` before either commits. Both compute a hash chained off the same parent, so the persisted chain forks at that point. The doc-comment in audit-log.ts says: "v1 accepts this; the verifier reports forks."

But the verifier in `scripts/verify-audit-chain.ts` does NOT actually distinguish a fork from a tamper. Both look like "the next row's expected hash doesn't match the actual hash, because the chain forward off `actual.length > 0 ? actual : null` (line 146) follows the persisted parent." On a fork: row A and row B both have prev=hash(genesis). Verifier walks: row A is computed off genesis - matches. Row B is computed off "row A's actual hash" (not the genesis it was actually chained against) - mismatches. Reported as a tamper.

So the comment is misleading: in v1, ANY fork is reported as a tamper. Which is fine operationally (rare event, manual review classifies) but means the verifier alert is noisier than the comment claims.

More important: the chain race window is the entire span between `select("row_hash").maybeSingle()` (line 438) and the eventual `insert(...)` completing. Two unrelated audit events (a CSP report + a user login, say) hitting the system within that ~10ms window will fork. Production audit-log rate is described as "single-digit ops/sec" but bursts during deploys (every server-start logs `app.boot`, plus CSP reports, plus a wave of authenticated requests) can exceed that.

**Severity:** Warning - not a correctness bug, but the documented mitigation ("verifier reports forks") doesn't match the verifier's actual behavior (reports forks AS tampers, indistinguishable). Either fix the verifier or fix the doc.

**Fix - Option A (cheap):** Update the verifier to first walk the chain, then on each detected mismatch check whether the row's `prev_hash` (recover by trial: look up a row whose `row_hash` equals the chain hash that the failing row's stored hash claims as parent) exists in the table. If yes -> classify as "fork" (warn, not error). If no -> classify as "tamper" (error). Exit code 1 only for tamper, exit code 0 with stderr warning for fork.

**Fix - Option B (correct):** Serialize the chain-write under a SELECT FOR UPDATE on the most-recent row, or use a serial Postgres advisory lock keyed off `audit_log_chain`. This eliminates forks entirely. Cost: every audit write takes a brief lock, but the audit insert is small and the lock holds only across the SELECT + INSERT. Production single-digit/sec write rate makes this comfortable.

**Fix - Option C (also correct):** Move the chain compute to a Postgres trigger that reads the current most-recent row inside the same transaction, using `LOCK TABLE audit_log IN SHARE ROW EXCLUSIVE MODE` or row-level locking on the latest row. Then the trigger writes the hash atomically with the insert. No client-side race window.

Adding a vitest race regression for the current behavior is also valuable - simulate two concurrent createAuditLogEntry calls and assert the verifier classification.

---

## Info

### IN-01: `app/apply/apply-form.tsx` reads a response field the route never returns

**File:** `app/apply/apply-form.tsx:99`, `app/api/beta-apply/route.ts:115`

**Issue:** `setAlreadyApplied(Boolean(data?.alreadyApplied))` - the route handler never returns an `alreadyApplied` field. It returns `{ success: true }` on success (line 115 of beta-apply/route.ts) and `{ error: ... }` on failure. So the `alreadyApplied` branch in the success message ("We already have your application") is dead code.

The wave dropped the email-uniqueness constraint because the email column is now encrypted (per CLAUDE.md plan §12.1), so the 23505 idempotent-success branch in the route was removed. The form code references a field that no longer exists.

**Fix:** Either remove the form state entirely:

```tsx
// Drop alreadyApplied state + the conditional copy.
{submitted && (
  <div className="flex flex-col items-center text-center py-6">
    <h2 className="mt-5 text-xl font-bold text-white">Application received</h2>
    <p className="mt-2 text-sm text-white/60 max-w-sm">
      Thanks - we&apos;ll review your application and reach out within 48 hours.
      ...
    </p>
  </div>
)}
```

Or re-introduce a soft-dedup in the route (best-effort lookup by ip+email pair within a recent window, since the email is opaque ciphertext now but ip + recent-window can find a likely re-submit) and start returning `{ success: true, alreadyApplied: true }` for those cases.

---

### IN-02: `app/api/free-audit/route.ts` host extraction can throw on malformed URLs after passing zod

**File:** `app/api/free-audit/route.ts:134`

**Issue:** `const host = new URL(website_url).hostname.toLowerCase()` - URL was already zod-validated against `.url()` (line 62 of validations.ts). Zod's `.url()` uses WHATWG URL parsing, which accepts some inputs that look weird but parse. For most reasonable URL inputs this works.

However: line 145, `await assertSafeUrl(website_url)` already validated the URL via SSRF check. By the time line 134 runs, the URL has been parsed twice. The third `new URL()` call won't fail. So this is fine.

Worth noting: the host-throttle key is `free-audit-host:${host}` - if an attacker submits `https://Foo.com/`, `https://foo.com/`, `https://www.foo.com/` they get three different host buckets. The hostname is lowercased but `www.` is not stripped. Minor evasion. Acceptable for the threat model.

**Fix (optional):** Normalize host by stripping `www.` for the rate-limit key only:

```typescript
const host = new URL(website_url).hostname.toLowerCase().replace(/^www\./, "")
```

---

### IN-03: CSP allowlist `app/demo/page.tsx` etc. is path-brittle

**File:** `tests/integration/csp-headers.test.ts:89-101`

**Issue:** Per the focus area: yes, this is path-brittle. If `app/demo/page.tsx` is renamed (which CLAUDE.md says is forbidden, but refactors happen), the test fails. The escape valve is the `// csp-allowed: <reason>` comment within 3 lines, which is fine.

The pattern works for now. The bigger concern is that someone adding a NEW `dangerouslySetInnerHTML` for an XSS-relevant purpose can use the comment escape to bypass review, since the test only checks for the LITERAL comment text, not the content of the reason. A `// csp-allowed: idk` comment passes.

**Fix (optional):** Require the comment to contain a longer justification:

```typescript
// In scanFileForDangerouslySetInnerHTML:
if (/\/\/\s*csp-allowed:\s*\S{20,}/i.test(lines[j])) {
  hasComment = true
  break
}
```

Or - better - require the comment to reference a docs/security/ file with a specific section:

```typescript
if (/\/\/\s*csp-allowed:\s*docs\/security\/[a-z0-9-]+\.md(#[a-z0-9-]+)?/.test(lines[j])) {
```

---

### IN-04: Site-crawl `getRequestMeta(request)` is not called inside `scanSitePages` - audit attribution would be lost if site-crawl ever audits

**File:** `lib/scan/run-site-crawl.ts:138-409`

**Issue:** `scanSitePages` is the shared site-crawl loop called by cron and manual triggers. The function persists scans + updates monitored_sites + calls `onLowScore` hooks but does NOT call `logAudit` anywhere. The cron job already logs its own boot/finish events; manual triggers do too. So this is fine today.

But if a future change adds an audit-log call inside the loop (which would be useful for "page X was scanned + flagged" attribution), there's no request context inside the function - the function takes a SupabaseClient + options, no Request object. The callers should pass `ip` and `userAgent` through the options object now so future audit writes have the right meta.

**Fix:** Extend `ScanSitePagesOptions` with optional `auditMeta?: { ip: string; userAgent: string }` and document the contract: "If you want audit entries from inside the loop, pass meta."

---

### IN-05: Step-up route success path issues a fresh session via `signInWithPassword` - documented but cookie-side-effects on a route that returns no normal session UI are surprising

**File:** `app/api/admin/step-up/route.ts:78-83`

**Issue:** The doc-comment at the top of the file (line 13) flags this: "we use createClient (not serviceClient) because signInWithPassword refreshes the session cookies as a side effect; we want THAT, since refreshing the main session at step-up time is the right thing to do anyway."

This is correct, but worth noting in REVIEW: the side effect is that the step-up POST silently rolls the user's main auth-token cookies. If a future change splits step-up into a "verify password without rolling session" call (e.g., for an MFA enrollment flow), this behavior will surprise the implementer. Worth a one-line code comment in the handler body, not just the file header:

```typescript
// SIDE EFFECT: signInWithPassword refreshes the main session cookies on success.
// Documented in the file header; intentional. If you don't want session refresh,
// use serviceClient.auth.admin.getUserByEmail + a separate password-verify call.
const { error } = await supabase.auth.signInWithPassword({ ... })
```

---

### IN-06: `lib/admin/step-up.ts` falls back to `ENCRYPTION_KEY_V1.slice(0, 32)` - this is a 32-char slice of a hex key, not a key

**File:** `lib/admin/step-up.ts:47-59`

**Issue:** Comment says "32 hex chars = 16 bytes of entropy" - which is accurate for the HMAC secret bytes, but the slice is taken in CHARACTER space, not byte space. `ENCRYPTION_KEY_V1` is validated by env.ts as 64 lowercase hex chars (so 32 bytes of entropy in the key). Slicing `.slice(0, 32)` gives the first 32 hex characters, which encode 16 bytes - half the master key's entropy. That's fine for HMAC-SHA256 (16 bytes is well over the safe-margin threshold), but:

- The slice is then passed to `createHmac("sha256", secret)` as a UTF-8 string, NOT as a Buffer. Node's createHmac will use the UTF-8 bytes of those 32 hex chars (so 32 bytes of representation, 128 bits of effective entropy).
- This works but is unnecessarily fragile - if anyone ever changes the slice length or normalizes the key, the HMAC seed changes and every existing step-up cookie becomes invalid.

Comment also says "Cross-env cookie reuse is broken (different master keys -> different secrets) which is desirable." Confirmed - if you rotate ENCRYPTION_KEY_V1 every step-up cookie immediately invalidates. Note for the operator: rotating ENCRYPTION_KEY_V1 will cause every admin to be re-prompted for step-up. Worth documenting in the rotation procedure (docs/security/rotation.md if it exists).

**Fix (optional):** Use a Buffer hex-decode so the slice is in byte space:

```typescript
if (fallback && fallback.length >= 64) {
  // hex-decode the first 32 bytes of the master key for HMAC seed. Avoids
  // any future ambiguity about char-vs-byte slicing.
  return Buffer.from(fallback.slice(0, 64), "hex").toString("base64url")
}
```

---

### IN-07: `cookie-consent.tsx` mirrors cookie value to localStorage without sanitization

**File:** `components/cookie-consent.tsx:18-21`

**Issue:** Line 18-21:
```typescript
const cookie = document.cookie
  .split("; ")
  .find((row) => row.startsWith("cookie_consent="))
if (cookie) {
  localStorage.setItem("cookie_consent", cookie.split("=")[1])
}
```

If an attacker sets a cookie like `cookie_consent=<script>alert(1)</script>`, the value is written to localStorage as-is. localStorage doesn't execute scripts, so this isn't an XSS - but the subsequent read on line 12 (`localStorage.getItem("cookie_consent")`) returns the unsanitized value and the rendering of the banner depends on whether `stored` is truthy. Truthy-or-not is the only check, so even an attacker-controlled value just makes the banner not display - which is the same as "user already consented." So no behavior change.

The only real risk is if a future change adds something like `if (stored === "accepted") loadAnalytics()`. If an attacker controls the cookie they can choose the consent string. But they can already do that by setting the cookie directly. So zero new attack surface.

**Severity:** Info. Code is fine as written.

**Fix (optional):** Validate that the cookie value is in the small allowed set before mirroring:

```typescript
const value = cookie.split("=")[1]
if (value === "accepted" || value === "declined") {
  localStorage.setItem("cookie_consent", value)
}
```

---

_Reviewed: 2026-05-20_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
