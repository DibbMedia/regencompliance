import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { waitlistSchema } from "@/lib/validations"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"
import { sendToGhl } from "@/lib/ghl"
import { deriveSource } from "@/lib/source-tracking"
import { createWaitlistEntry } from "@/lib/repos/waitlist"
import { parseUtmCookieFromRequest } from "@/lib/utm"

export const maxDuration = 10

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)

    // Global cap first — 200 signups/hour across all IPs blunts IP-churning
    // bot networks. Returns the same generic 429 so probes can't tell whether
    // they hit the per-IP or the global cap.
    const global = await checkRateLimit("waitlist-global", 200, 60 * 60 * 1000)
    if (!global.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status: 429 }
      )
    }

    // 5 signups per IP per 10 minutes. Per plan §12.1 the email unique
    // constraint is gone (encryption made it impossible to enforce), so the
    // rate limits are now the only line of defense against dup spam. Worst
    // case: ~5 dup rows per attacker IP per 10 min; admin dedupes manually.
    const limit = await checkRateLimit(`waitlist:${ip}`, 5, 10 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const parsed = waitlistSchema.safeParse(body)
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return NextResponse.json(
        { error: first?.message || "Invalid input" },
        { status: 400 }
      )
    }

    const { name, email } = parsed.data
    const userAgent = request.headers.get("user-agent")?.slice(0, 500) || null

    const supabase = createServiceClient()

    try {
      await createWaitlistEntry(supabase, {
        name,
        email,
        ip_address: ip,
        user_agent: userAgent,
        source: deriveSource(request),
      })
    } catch (err) {
      // Per plan §12.1 there is no longer a 23505 idempotent-success path -
      // the unique constraint on email was dropped because it can't survive
      // encryption. Any insert error here is a real failure.
      console.error("Waitlist insert error:", err)
      return NextResponse.json(
        { error: "Failed to join waitlist. Please try again." },
        { status: 500 }
      )
    }

    // Pull UTM cookie set by the landing page tracker. Fail-open: missing
    // or malformed cookie returns {} so the GHL upsert still fires with no
    // UTM fields (organic traffic). Read directly off the Request header
    // rather than next/headers cookies() so vitest can call POST(req)
    // without a Next request scope.
    const utm = parseUtmCookieFromRequest(request)

    // GHL pipeline: tag the waitlist contact and drop into the nurture workflow.
    void sendToGhl("waitlist", {
      email,
      name,
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
    console.error("Waitlist route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
