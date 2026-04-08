import { NextResponse } from "next/server"
import { checkLoginAllowed, recordFailedLogin, clearLoginAttempts } from "@/lib/login-protection"
import { logAudit, getRequestMeta } from "@/lib/audit-log"

export async function POST(request: Request) {
  const { ip, userAgent } = getRequestMeta(request)
  const body = await request.json()
  const { email, success } = body

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }

  if (success === true) {
    // Clear failed attempts on successful login
    clearLoginAttempts(email)
    logAudit({ user_email: email, action: "auth.login.success", ip_address: ip, user_agent: userAgent })
    return NextResponse.json({ ok: true })
  }

  if (success === false) {
    // Record failed attempt
    recordFailedLogin(email)
    logAudit({ user_email: email, action: "auth.login.failed", status: "failure", ip_address: ip, user_agent: userAgent })
    const { allowed, remainingAttempts, lockedUntil } = checkLoginAllowed(email)
    return NextResponse.json({ allowed, remainingAttempts, lockedUntil })
  }

  // Just check if allowed (pre-login check)
  const { allowed, remainingAttempts, lockedUntil } = checkLoginAllowed(email)
  return NextResponse.json({ allowed, remainingAttempts, lockedUntil })
}
