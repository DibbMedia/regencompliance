// Server-side login proxy. Additive to the existing client-direct
// supabase.auth.signInWithPassword() flow - the login form can be
// migrated to POST here whenever the UI team wants the extra defense.
//
// Why server-side matters: the current /api/auth/check-login route is
// advisory - the client reports success/failure after it calls
// signInWithPassword directly, and an attacker can skip the report
// call to bypass the per-email lockout. With this proxy, the server
// calls Supabase itself, so lockout enforcement is mandatory.
//
// Behavior matches check-login's security contract:
//   - Per-IP rate limit first (DoS floor)
//   - Lockout pre-check (fail fast if email is locked)
//   - Credential attempt via Supabase server client (sets session cookies)
//   - Record failure / clear attempts based on Supabase result
//   - Audit every outcome
//
// Response shape:
//   200 { user, session }                 - success
//   401 { error, allowed, remainingAttempts, lockedUntil? }
//                                         - bad credentials or email locked
//   429 { error }                         - IP rate limited
//   400 { error }                         - malformed body / missing email
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"
import { logAudit, getRequestMeta } from "@/lib/audit-log"
import { checkLoginAllowed, recordFailedLogin, clearLoginAttempts } from "@/lib/login-protection"
import { loginSchema } from "@/lib/validations"

export async function POST(request: Request) {
  const { ip, userAgent } = getRequestMeta(request)
  const clientIp = getClientIp(request)

  // 1. Per-IP floor - applies before any DB read, keeps cost low under abuse.
  // 10/15min is the OWASP credential-stuffing recommendation. Tightened from
  // 30/15min on 2026-05-13 per security audit; per-email lockout (5 fails
  // -> 15 min, see lib/login-protection.ts) remains the primary defense.
  const { allowed: ipAllowed } = await checkRateLimit(`login-ip:${clientIp}`, 10, 15 * 60 * 1000)
  if (!ipAllowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  // 2. Parse + validate body.
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
  }
  const { email, password } = parsed.data

  // 3. Pre-check lockout. Locked accounts skip the Supabase call entirely.
  // The lockout-already-triggered branch can return lockedUntil because
  // the only way to reach it is via 5+ prior failed attempts on this
  // email, by which point an attacker has already confirmed the email
  // exists. Suppression matters on the bad-credentials branch below
  // (first failure should not differentiate known vs unknown emails).
  const preCheck = await checkLoginAllowed(email)
  if (!preCheck.allowed) {
    logAudit({
      user_email: email,
      action: "auth.login.locked",
      status: "failure",
      ip_address: ip,
      user_agent: userAgent,
    })
    return NextResponse.json(
      {
        error: "Account temporarily locked due to too many failed attempts.",
        allowed: false,
        lockedUntil: preCheck.lockedUntil,
      },
      { status: 401 },
    )
  }

  // 4. Attempt credentials via server-side Supabase client. Session cookies
  //    are set automatically by the @supabase/ssr helper.
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data?.session) {
    // Record the failure + re-evaluate lockout state.
    await recordFailedLogin(email)
    const after = await checkLoginAllowed(email)
    logAudit({
      user_email: email,
      action: "auth.login.failed",
      status: "failure",
      ip_address: ip,
      user_agent: userAgent,
    })
    // Generic message + suppress lockout details until the user is
    // actually locked. Returning lockedUntil on every 401 lets an
    // attacker enumerate emails by watching for the timestamp shape.
    return NextResponse.json(
      {
        error: "Invalid email or password.",
        allowed: after.allowed,
        ...(after.allowed
          ? {}
          : { lockedUntil: after.lockedUntil }),
      },
      { status: 401 },
    )
  }

  // 5. Success path - clear attempts, audit, return session.
  await clearLoginAttempts(email)
  logAudit({
    user_id: data.user?.id,
    user_email: email,
    action: "auth.login.success",
    ip_address: ip,
    user_agent: userAgent,
  })

  return NextResponse.json({ user: data.user, session: data.session })
}
