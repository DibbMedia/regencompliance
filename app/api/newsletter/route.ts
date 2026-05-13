import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { newsletterSchema } from "@/lib/validations"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"
import { createNewsletterSubscriber } from "@/lib/repos/newsletter-subscribers"

export const maxDuration = 10

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)

    // Global cap first - 500/hour across all IPs blocks bot networks that
    // churn IPs. Generic 429 so probes can't tell which cap they hit.
    const global = await checkRateLimit("newsletter-global", 500, 60 * 60 * 1000)
    if (!global.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status: 429 }
      )
    }

    // Per plan §12.1 the email unique constraint is gone. Rate limits are
    // the only dup-spam defense now.
    const limit = await checkRateLimit(`newsletter:${ip}`, 5, 10 * 60 * 1000)
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

    const parsed = newsletterSchema.safeParse(body)
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return NextResponse.json(
        { error: first?.message || "Invalid input" },
        { status: 400 }
      )
    }

    const { email, source, sourceSlug } = parsed.data
    const userAgent = request.headers.get("user-agent")?.slice(0, 500) || null

    const supabase = createServiceClient()

    try {
      await createNewsletterSubscriber(supabase, {
        email,
        source: source || "blog",
        source_slug: sourceSlug || null,
        ip_address: ip,
        user_agent: userAgent,
      })
    } catch (err) {
      // No 23505 idempotent path: unique-email constraint dropped per plan §12.1.
      console.error("Newsletter insert error:", err)
      return NextResponse.json(
        { error: "Failed to subscribe. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Newsletter route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
