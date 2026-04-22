import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { newsletterSchema } from "@/lib/validations"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"

export const maxDuration = 10

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)

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
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email,
      source: source || "blog",
      source_slug: sourceSlug || null,
      ip_address: ip,
      user_agent: userAgent,
    })

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ success: true, alreadySubscribed: true })
      }
      console.error("Newsletter insert error:", error)
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
