import { NextResponse } from "next/server"
import { checkLoginAllowed, recordFailedLogin, clearLoginAttempts } from "@/lib/login-protection"
import { logAudit, getRequestMeta } from "@/lib/audit-log"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"

export async function POST(request: Request) {
  const { ip, userAgent } = getRequestMeta(request)

  const clientIp = getClientIp(request)
  const { allowed: ipAllowed } = await checkRateLimit(`login-ip:${clientIp}`, 30, 15 * 60 * 1000)
  if (!ipAllowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const body = await request.json()
  const { email, success } = body

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }

  if (success === true) {
    await clearLoginAttempts(email)
    logAudit({ user_email: email, action: "auth.login.success", ip_address: ip, user_agent: userAgent })
    return NextResponse.json({ ok: true })
  }

  if (success === false) {
    await recordFailedLogin(email)
    logAudit({ user_email: email, action: "auth.login.failed", status: "failure", ip_address: ip, user_agent: userAgent })
    const { allowed, remainingAttempts, lockedUntil } = await checkLoginAllowed(email)
    return NextResponse.json({ allowed, remainingAttempts, lockedUntil })
  }

  const { allowed, remainingAttempts, lockedUntil } = await checkLoginAllowed(email)
  return NextResponse.json({ allowed, remainingAttempts, lockedUntil })
}
