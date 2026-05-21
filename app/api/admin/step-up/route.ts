// POST /api/admin/step-up
//
// Admin re-authentication endpoint. The admin POSTs their CURRENT password;
// if Supabase accepts it, we issue a short-lived (5 min) `rc_admin_stepup`
// cookie scoped to /api/admin. Destructive admin routes (impersonate, user
// delete) check the cookie before executing.
//
// Behavior:
//   - verifyAdmin() first - non-admins get 403 with no password attempt.
//   - Per-IP rate limit (5/min). Step-up is low traffic; this floor catches
//     a stolen session being used to brute-force a weak admin password.
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
//   429 { error: "Too many requests" }    - per-IP rate limit
//   400 { error: ... }                    - malformed body

import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"
import { logAudit, getRequestMeta } from "@/lib/audit-log"
import {
  STEP_UP_COOKIE,
  STEP_UP_COOKIE_PATH,
  signStepUpCookie,
} from "@/lib/admin/step-up"

export const maxDuration = 10

export async function POST(request: Request) {
  const { ip, userAgent } = getRequestMeta(request)
  const clientIp = getClientIp(request)

  // 1. Per-IP rate limit. Tight (5/min) because step-up is a single button
  //    press from the operator's perspective; sustained traffic is abuse.
  const { allowed } = await checkRateLimit(`admin-step-up:${clientIp}`, 5, 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  // 2. Caller must be a platform admin in the first place.
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error
  const { user } = auth

  if (!user.email) {
    // Defensive: admin session w/o email shouldn't happen, but if it does
    // we can't call signInWithPassword.
    return NextResponse.json({ error: "Account email missing" }, { status: 400 })
  }

  // 3. Parse body.
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
  const password = (body as Record<string, unknown>).password
  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json({ error: "Password required" }, { status: 400 })
  }

  // 4. Re-verify the password via Supabase Auth. We use createClient (not
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

  // 5. Mint and attach the step-up cookie. HttpOnly + SameSite=Strict +
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
