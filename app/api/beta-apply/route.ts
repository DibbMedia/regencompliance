import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { betaApplicationSchema } from "@/lib/validations"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"
import { sendToGhl } from "@/lib/ghl"
import { deriveSource } from "@/lib/source-tracking"
import { createBetaApplication } from "@/lib/repos/beta-applications"
import { parseUtmCookieFromRequest } from "@/lib/utm"

export const maxDuration = 10

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)

    const global = await checkRateLimit("beta-apply-global", 200, 60 * 60 * 1000)
    if (!global.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status: 429 },
      )
    }

    // Per plan §12.1 the email unique constraint is gone (encryption can't
    // enforce it). Rate limits are the only dup-spam defense now.
    const limit = await checkRateLimit(`beta-apply:${ip}`, 3, 10 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status: 429 },
      )
    }

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const parsed = betaApplicationSchema.safeParse(body)
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return NextResponse.json(
        { error: first?.message || "Invalid input" },
        { status: 400 },
      )
    }

    const { name, email, clinic_name, specialty, role, website, monthly_volume, why_apply } = parsed.data
    const userAgent = request.headers.get("user-agent")?.slice(0, 500) || null

    const supabase = createServiceClient()

    try {
      await createBetaApplication(supabase, {
        name,
        email,
        clinic_name,
        specialty,
        role,
        website: website || null,
        monthly_volume,
        why_apply,
        ip_address: ip,
        user_agent: userAgent,
        source: deriveSource(request),
      })
    } catch (err) {
      // No 23505 idempotent path: the unique-email constraint was dropped
      // alongside Phase 6 encryption (plan §12.1). Duplicates just write a
      // second row; admin dedupe is manual.
      console.error("Beta application insert error:", err)
      return NextResponse.json(
        { error: "Failed to submit application. Please try again." },
        { status: 500 },
      )
    }

    // Pull UTM cookie set by the landing page tracker. Fail-open.
    // Reads off Request.headers so vitest can call POST(req) without a
    // Next request scope.
    const utm = parseUtmCookieFromRequest(request)

    // GHL pipeline: drop the applicant into the founder-beta review workflow.
    void sendToGhl("beta_apply", {
      email,
      name,
      company: clinic_name,
      specialty,
      role,
      website: website || null,
      monthly_volume,
      why_apply,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      utm_term: utm.utm_term,
      utm_content: utm.utm_content,
      referrer: utm.referrer,
      landing_path: utm.landing_path,
      first_seen_at: utm.captured_at,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Beta apply route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
