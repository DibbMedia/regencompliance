// Server-side forgot-password proxy.
//
// Pre-2026-05-05 the forgot-password page called supabase.auth.resetPasswordForEmail
// from the browser directly. Supabase has internal send caps but no per-IP
// floor and no per-email cap visible to us, so an attacker could spam reset
// emails to enumerate inboxes or cause Supabase to throttle the project's
// outbound mail. This proxy adds:
//   - Per-IP cap (5 / 15min) - DoS floor
//   - Per-email cap (3 / hour) - prevents harassment / enumeration via timing
//   - Audit log entry on every attempt (success or rate-limit)
//
// Response shape is generic: 200 always, regardless of whether the email
// exists, so an attacker can't enumerate accounts. The actual email send
// only happens for real accounts.
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"
import { logAudit, getRequestMeta } from "@/lib/audit-log"
import { z } from "zod"
import { appUrl } from "@/lib/site-url"

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
})

export async function POST(request: Request) {
  const { ip, userAgent } = getRequestMeta(request)
  const clientIp = getClientIp(request)

  const ipLimit = await checkRateLimit(`forgot-pw-ip:${clientIp}`, 5, 15 * 60 * 1000)
  if (!ipLimit.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid email" }, { status: 400 })
  }
  const { email } = parsed.data

  // Per-email cap: 3 reset emails per hour. Mirrors the spirit of Supabase's
  // built-in caps but at our edge so we can audit + tune without dashboard work.
  const emailLimit = await checkRateLimit(`forgot-pw-email:${email}`, 3, 60 * 60 * 1000)
  if (!emailLimit.allowed) {
    logAudit({ user_email: email, action: "auth.forgot_password.throttled", status: "failure", ip_address: ip, user_agent: userAgent })
    // Same 200 generic response so callers can't tell whether they hit the
    // cap or whether the email is unknown.
    return NextResponse.json({ ok: true })
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: appUrl("/auth/reset-password"),
  })

  if (error) {
    // Log the failure server-side; still return generic 200 to client to
    // prevent enumeration.
    console.error("[forgot-password] supabase error:", error.message)
    logAudit({ user_email: email, action: "auth.forgot_password.failed", status: "error", ip_address: ip, user_agent: userAgent })
  } else {
    logAudit({ user_email: email, action: "auth.forgot_password.requested", ip_address: ip, user_agent: userAgent })
  }

  return NextResponse.json({ ok: true })
}
