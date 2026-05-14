import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"
import { signupSchema } from "@/lib/validations"
import { checkPasswordBreach } from "@/lib/password-breach"
import { sendToGhl } from "@/lib/ghl"
import { logAudit, getRequestMeta } from "@/lib/audit-log"

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const { allowed } = await checkRateLimit(`signup-ip:${ip}`, 5, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again later." },
      { status: 429 },
    )
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const parsed = signupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
  }

  // Defense-in-depth: reject passwords that appear in known-breach
  // datasets via HIBP k-anonymity (password itself never leaves the
  // server). Fails open on network error so a HIBP outage doesn't
  // block legitimate signups; zod's complexity rules are still enforced.
  const breach = await checkPasswordBreach(parsed.data.password)
  if (breach.breached) {
    return NextResponse.json(
      {
        error:
          "This password has appeared in a known data breach. Please choose a different password.",
      },
      { status: 400 },
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    // Generic response prevents user-enumeration: "User already registered"
    // would tell an attacker which emails are in use. Real error is logged
    // server-side only.
    console.error("[signup] supabase error:", error.message, error.status)
    return NextResponse.json(
      { error: "Could not create account. If the problem persists, contact support." },
      { status: 400 },
    )
  }

  // GHL contact-create webhook (fire-and-forget; no-ops if env unset).
  // Marketing/onboarding sequences live in GHL per the Email Policy in CLAUDE.md.
  void sendToGhl("signup", {
    email: parsed.data.email,
    user_id: data.user?.id ?? null,
    confirmed_at: data.user?.confirmed_at ?? null,
  })

  // SOC 2: pre-auth signup audit entry (system-key, no user_id since the
  // user hasn't confirmed email yet). Captures the registration attempt for
  // forensic timeline reconstruction.
  const { userAgent } = getRequestMeta(request)
  logAudit({
    action: "auth.signup",
    resource_type: data.user?.id ? "user" : undefined,
    resource_id: data.user?.id ?? undefined,
    details: { confirmed: !!data.user?.confirmed_at },
    ip_address: ip,
    user_agent: userAgent,
  })

  return NextResponse.json({ user: data.user, session: data.session })
}
