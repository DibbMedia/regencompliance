import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { waitlistSchema } from "@/lib/validations"
import { checkRateLimit } from "@/lib/rate-limit"

export const maxDuration = 10

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"

    // 5 signups per IP per 10 minutes
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
    const { error } = await supabase.from("waitlist").insert({
      name,
      email,
      ip_address: ip,
      user_agent: userAgent,
      source: "website",
    })

    if (error) {
      // Postgres unique_violation
      if (error.code === "23505") {
        // Idempotent: pretend success so we don't leak which emails exist
        return NextResponse.json({ success: true, alreadyOnList: true })
      }
      console.error("Waitlist insert error:", error)
      return NextResponse.json(
        { error: "Failed to join waitlist. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Waitlist route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
