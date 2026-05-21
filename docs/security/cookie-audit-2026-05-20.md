# Cookie hardening audit - 2026-05-20

Comprehensive sweep of every server- and client-set cookie in the RegenCompliance
application. Documents the attribute matrix (HttpOnly / Secure / SameSite / Path /
Max-Age), the reader, and the justification for any deviation from the default
"HttpOnly + Secure-in-prod + SameSite=Lax + Path=/" baseline.

The snapshot test at `tests/integration/cookie-hardening.test.ts` enforces this
matrix in CI so a future cookie added without proper flags fails the build.

## Audit table

| Cookie name        | Set at                                  | Read at                                                                | HttpOnly                | Secure        | SameSite | Path        | Max-Age   | Justification                                                                                                                                                                |
| ------------------ | --------------------------------------- | ---------------------------------------------------------------------- | ----------------------- | ------------- | -------- | ----------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sb-*-auth-token`  | `proxy.ts` (via `@supabase/ssr`)        | server (`createClient`) + browser (`createBrowserClient`)              | **no** (Supabase decides) | prod-only     | lax      | /           | session   | The `@supabase/ssr` browser SDK reads this cookie via `document.cookie`. Forcing HttpOnly=true breaks the client SDK silently with "skeleton stuck forever" symptom (#2924, user-memory `feedback_supabase_ssr_no_httponly.md`). Supabase chooses HttpOnly per cookie. |
| `sb-*-code-verifier` | `proxy.ts` (via `@supabase/ssr`)      | server only                                                            | yes (Supabase sets it)  | prod-only     | lax      | /           | short     | PKCE OAuth flow. Set + read by Supabase SDK; server-only.                                                                                                                    |
| `rc_utm`           | `app/api/utm/track/route.ts`            | server routes (waitlist, free-audit, beta-apply, signup)                | yes                     | prod-only     | lax      | /           | 30 days   | UTM attribution; server-read only. Locked contract documented in `lib/utm.ts`.                                                                                              |
| `rc_beta_claim`    | `app/api/beta/stash-claim/route.ts`     | server (`app/auth/callback/route.ts`) + client (`app/login/page.tsx`)   | **no** (intentional)    | prod-only     | lax      | /           | 30 min    | Per-Wave-2E design: client login page reads via `document.cookie` to POST `/api/beta/claim`. Value is a non-credential reservation_token UUID. Cleared on success and on callback. |
| `regen_demo`       | `app/api/demo/scan/route.ts`            | server (`/api/demo/scan` rate-limit logic)                              | yes                     | prod-only     | lax      | /           | 90 days   | Demo scan count + HMAC sig. Server-only state.                                                                                                                              |
| `regen_impersonate`| `lib/impersonation.ts`                  | server (proxy.ts + admin routes)                                       | yes                     | prod-only     | strict   | /           | 30 min    | Admin impersonation session id. `SameSite=strict` because impersonation is a privileged state-changing context.                                                              |
| `__regen_su`       | `app/api/admin/step-up/route.ts`        | server (admin step-up gate)                                            | yes                     | prod-only     | strict   | /api/admin  | short     | Admin password step-up proof. Scoped to `/api/admin` only - never sent to public routes or readable by any client JS.                                                       |
| `cookie_consent`   | `components/cookie-consent.tsx` (client) | client (re-read on next visit) + localStorage mirror                   | n/a (client-set)        | https-only    | lax      | /           | 1 year    | Consent decision is non-sensitive but tagged Secure on HTTPS pages for hygiene.                                                                                              |
| `sidebar_state`    | `components/ui/sidebar.tsx` (client)    | shadcn `SidebarProvider` hydrate                                       | n/a (client-set)        | (none)        | (default = Lax) | / | 7 days    | UI-only preference (sidebar collapsed/expanded). No security boundary; intentionally minimal to keep shadcn's upstream component unmodified.                                |

## Status changes vs. pre-audit state

| Cookie           | Before                                                       | After                                                | Reason                                                                                       |
| ---------------- | ------------------------------------------------------------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `sb-*-auth-token` (Supabase) | `proxy.ts` was forcing `httpOnly: true` on every Supabase cookie | `proxy.ts` no longer overrides Supabase's per-cookie HttpOnly decision | Forcing HttpOnly:true silently breaks the client SDK ("skeleton stuck forever"); CSRF defense is still enforced via SameSite=Lax + Secure-in-prod. |
| `regen_demo`     | `secure: true` (hardcoded)                                   | `secure: process.env.NODE_ENV === "production"`      | Hardcoded `true` prevented the cookie from sticking on `http://localhost`, making the demo flow appear to reset between requests during dev. |
| `cookie_consent` | (no Secure flag)                                             | `; Secure` appended when page is served over HTTPS    | Defense-in-depth - consent record should not be transmittable over plaintext when the page itself is HTTPS. |

## Notes / out-of-scope

- **`lib/admin/step-up.ts` + `__regen_su` cookie** — Owned by Agent C+D. Documented
  in the audit table for completeness but not modified by this audit.
- **`lib/utm.ts` + `rc_utm` cookie** — Already audited at landing. Excluded from
  this audit's edit scope; included in the table for the canonical record.
- **`regen_impersonate` cookie** — Already audited as a known-good cookie set by
  the impersonation flow. Documented but not modified.
- **Test cookies (under `tests/`)** — Out of scope per audit brief.

## Future cookie additions

When adding a new cookie:
1. Default to **HttpOnly + Secure-in-prod + SameSite=Lax + Path=/ + explicit Max-Age**.
2. Deviate only with a documented reason in `cookie-audit-YYYY-MM-DD.md`.
3. Add the cookie to the snapshot test at `tests/integration/cookie-hardening.test.ts`
   so its attributes are enforced in CI.

The single class of cookies that legitimately needs `HttpOnly=false` is one read
by client JavaScript (e.g. the `@supabase/ssr` auth-token, the `rc_beta_claim`
reservation_token read by the login page). All other cookies should remain
HttpOnly.

`SameSite=Strict` belongs on privileged state-changing flows (impersonation,
admin step-up). Everything else should be `Lax` so cross-site `<a href>`
navigation from email/marketing into the app continues to carry the session.

`Secure=true` should **never** be hardcoded - always gate on
`process.env.NODE_ENV === "production"` (or, for client-set cookies, on
`window.location.protocol === "https:"`) so dev/localhost flows continue to work.
