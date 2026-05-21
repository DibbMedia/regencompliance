// POST /api/admin/step-up
//
// Admin re-authentication endpoint. The admin POSTs their CURRENT password;
// if Supabase accepts it, we issue a short-lived (5 min) `rc_admin_stepup`
// cookie scoped to /api/admin. Destructive admin routes (impersonate, user
// delete) check the cookie before executing.
//
// Behavior:
//   - Per-IP rate limit (5/min) FIRST, before any body parse or auth check,
//     to bound the cost of malformed traffic. The IP source is derived from
//     proxy-set headers (x-vercel-forwarded-for, cf-connecting-ip) BEFORE
//     falling back to leftmost x-forwarded-for; the shared lib/ip helper
//     prefers RIGHTMOST XFF which is the audit-attribution semantics and
//     wrong for a security gate (CR-02 / WR-04).
//   - verifyAdmin() next - non-admins get 403 with no password attempt.
//   - Per-account rate limit (5/15min) keyed on a sha256(user.id) so an
//     attacker who rotates IPs cannot bypass the per-IP floor and brute-
//     force the admin's password. Hashing keeps the raw uuid out of the
//     rate_limits table (no enumeration of "admin X has tried N times").
//   - signInWithPassword against the admin's own email. Note: this hits
//     Supabase Auth and DOES trigger an auth event (`last_sign_in_at` will
//     bump). That's intentional and acceptable: the operator should see
//     admin re-auth events in their auth dashboard + audit log; if the
//     timestamp moves without the admin's knowledge, that's a signal.
//   - On success: set the cookie via signStepUpCookie() + audit
//     `admin.step_up` / status=success.
//   - On failure: do NOT clear an existing cookie (avoids letting a CSRF
//     attempt-with-wrong-password downgrade a fresh step-up); audit failure.
//
// Response shape:
//   200 { ok: true, expires_in: 300 }    - cookie issued
//   401 { error: "invalid_password" }     - wrong password
//   403 { error: "Forbidden" }            - caller not an admin
//   429 { error: ... }                    - per-IP or per-account rate limit
//   400 { error: ... }                    - malformed body

import { createHash } from "node:crypto"
import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { logAudit, getRequestMeta } from "@/lib/audit-log"
import {
  STEP_UP_COOKIE,
  STEP_UP_COOKIE_PATH,
  signStepUpCookie,
} from "@/lib/admin/step-up"

export const maxDuration = 10

// IP source for the step-up security gate. Inlined here (rather than using
// lib/ip.ts's getClientIp) because the shared helper falls back to RIGHTMOST
// x-forwarded-for on non-Vercel hosts, which is spoofable - an attacker
// prepends their own IP to the header and the trusted-proxy semantics shift
// the "real" client to whatever value they choose. For a brute-force gate we
// need the LEFTMOST entry (RFC 7239 original client), and we prefer infra-
// set headers (x-vercel-forwarded-for, cf-connecting-ip) above XFF entirely
// because those cannot be set by the client.
function getAdminClientIp(request: Request): string {
  const vercel = request.headers.get("x-vercel-forwarded-for")?.trim()
  if (vercel) return vercel.split(",")[0].trim()
  const cf = request.headers.get("cf-connecting-ip")?.trim()
  if (cf) return cf
  const xff = request.headers.get("x-forwarded-for")?.trim()
  if (xff) return xff.split(",")[0].trim()
  return request.headers.get("x-real-ip")?.trim() || "unknown"
}

export async function POST(request: Request) {
  const { ip, userAgent } = getRequestMeta(request)
  const clientIp = getAdminClientIp(request)

  // 1. Per-IP rate limit. Tight (5/min) because step-up is a single button
  //    press from the operator's perspective; sustained traffic is abuse.
  //    Runs BEFORE body parse so a malformed-request flood can't bypass
  //    this floor.
  const perIp = await checkRateLimit(`admin-step-up:${clientIp}`, 5, 60 * 1000)
  if (!perIp.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  // 2. Caller must be a platform admin in the first place.
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error
  const { user } = auth

  // 3. Per-account rate limit. Bounds total brute-force attempts against a
  //    given admin account regardless of source IP (IP rotation is cheap;
  //    accounts are not). Key is sha256(user.id) sliced to 64 bits so the
  //    rate_limits table doesn't leak raw admin uuids to anyone with read
  //    access. Audit the lockout before returning so the trail shows the
  //    cap tripped (vs silent 429).
  const userIdHash = createHash("sha256").update(user.id).digest("hex").slice(0, 16)
  const perAccount = await checkRateLimit(
    `admin-step-up-acct:${userIdHash}`,
    5,
    15 * 60 * 1000,
  )
  if (!perAccount.allowed) {
    logAudit({
      user_id: user.id,
      user_email: user.email,
      action: "admin.step_up.lockout",
      status: "failure",
      ip_address: ip,
      user_agent: userAgent,
      details: { reason: "per-account brute-force cap" },
    })
    return NextResponse.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 },
    )
  }

  if (!user.email) {
    // Defensive: admin session w/o email shouldn't happen, but if it does
    // we can't call signInWithPassword.
    return NextResponse.json({ error: "Account email missing" }, { status: 400 })
  }

  // 4. Parse body. Done AFTER both rate limits so a malformed-body flood
  //    is bounded by the same caps as a real attempt.
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
  const password = (body as Record<string, unknown>).password
  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json({ error: "Password required" }, { status: 400 })
  }

  // 5. Re-verify the password via Supabase Auth. We use createClient (not
  //    serviceClient) because signInWithPassword refreshes the session
  //    cookies as a side effect; we want THAT, since refreshing the main
  //    session at step-up time is the right thing to do anyway.
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  })

  if (error) {
    logAudit({
      user_id: user.id,
      user_email: user.email,
      action: "admin.step_up",
      status: "failure",
      ip_address: ip,
      user_agent: userAgent,
      details: { reason: "invalid_password" },
    })
    return NextResponse.json({ error: "invalid_password" }, { status: 401 })
  }

  // 6. Mint and attach the step-up cookie. HttpOnly + SameSite=Strict +
  //    Path=/api/admin keeps it out of public routes and from being read by
  //    any client JS.
  const { value, maxAge } = signStepUpCookie(user.id)
  const isProd = process.env.NODE_ENV === "production"
  const response = NextResponse.json({ ok: true, expires_in: maxAge })
  response.cookies.set({
    name: STEP_UP_COOKIE,
    value,
    httpOnly: true,
    path: STEP_UP_COOKIE_PATH,
    sameSite: "strict",
    secure: isProd,
    maxAge,
  })

  logAudit({
    user_id: user.id,
    user_email: user.email,
    action: "admin.step_up",
    status: "success",
    ip_address: ip,
    user_agent: userAgent,
  })

  return response
}
