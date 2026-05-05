// Server-side reset-password proxy.
//
// Wraps supabase.auth.updateUser({password}) with the same defenses signup gets:
//   - Per-IP rate limit (5 / 15min)
//   - HIBP breach check on the new password (k-anonymity, fail-open)
//   - Audit log entry per outcome
//   - Revoke other sessions on success
//
// Pre-2026-05-05 reset went directly through the browser supabase client
// with no HIBP check and no app-layer rate limit, letting a user pick a
// breached password during reset (signup blocks them, reset did not).
//
// Auth state: the client sets the recovery session via the URL hash and the
// @supabase/ssr cookie helper writes it; the server reads the same cookie.
// updateUser() applies to that recovery session.
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"
import { logAudit, getRequestMeta } from "@/lib/audit-log"
import { passwordSchema } from "@/lib/validations"
import { checkPasswordBreach } from "@/lib/password-breach"
import { z } from "zod"

const schema = z.object({ password: passwordSchema })

export async function POST(request: Request) {
  const { ip, userAgent } = getRequestMeta(request)
  const clientIp = getClientIp(request)

  const ipLimit = await checkRateLimit(`reset-pw-ip:${clientIp}`, 5, 15 * 60 * 1000)
  if (!ipLimit.allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid password" }, { status: 400 })
  }

  // HIBP breach check (k-anonymity, fails open on network error).
  const breach = await checkPasswordBreach(parsed.data.password)
  if (breach.breached) {
    return NextResponse.json(
      { error: "This password has appeared in a known data breach. Please choose a different password." },
      { status: 400 },
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // No recovery session = caller never clicked the reset email link, or
    // the link expired. Don't try the update.
    return NextResponse.json({ error: "Reset link is invalid or has expired. Please request a new one." }, { status: 401 })
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })

  if (error) {
    console.error("[reset-password] supabase error:", error.message)
    logAudit({ user_id: user.id, user_email: user.email, action: "auth.reset_password.failed", status: "error", ip_address: ip, user_agent: userAgent })
    return NextResponse.json({ error: "Failed to reset password. Please request a new reset link." }, { status: 400 })
  }

  // Revoke every other active session - the old password is no longer valid
  // anywhere. Best-effort; don't block the success response on this.
  try {
    await supabase.auth.signOut({ scope: "others" })
  } catch {
    /* non-fatal */
  }

  logAudit({ user_id: user.id, user_email: user.email, action: "auth.reset_password.success", ip_address: ip, user_agent: userAgent })
  return NextResponse.json({ ok: true })
}
