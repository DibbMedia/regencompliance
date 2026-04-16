import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServiceClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"

const BETA_SEAT_LIMIT = 25

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin") || ""
    const referer = request.headers.get("referer") || ""
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""

    if (appUrl) {
      const allowedOrigin = new URL(appUrl).origin
      const requestOrigin = origin || (referer ? new URL(referer).origin : "")

      if (!requestOrigin || requestOrigin !== allowedOrigin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const ip = getClientIp(request)
    const { allowed } = await checkRateLimit(`checkout-beta:${ip}`, 10, 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many checkout requests. Please try again later." },
        { status: 429 }
      )
    }

    const supabase = createServiceClient()
    const { count, error: countError } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_beta_subscriber", true)

    if (countError) {
      console.error("Beta seat count error:", countError)
      return NextResponse.json({ error: "Failed to check beta availability" }, { status: 500 })
    }

    const taken = count ?? 0
    if (taken >= BETA_SEAT_LIMIT) {
      return NextResponse.json(
        { error: "Beta spots are full", spots_remaining: 0 },
        { status: 409 }
      )
    }

    const { count: pendingCount } = await supabase
      .from("beta_purchases")
      .select("id", { count: "exact", head: true })
      .eq("claimed", false)

    const totalReserved = taken + (pendingCount ?? 0)
    if (totalReserved >= BETA_SEAT_LIMIT) {
      return NextResponse.json(
        { error: "Beta spots are full", spots_remaining: 0 },
        { status: 409 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_BETA_PRICE_ID!, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/login?beta=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: { plan_type: "beta_subscription" },
      subscription_data: {
        metadata: { plan_type: "beta_subscription" },
      },
    })

    return NextResponse.json({
      url: session.url,
      spots_remaining: BETA_SEAT_LIMIT - totalReserved,
    })
  } catch (error) {
    console.error("Beta checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 })
  }
}
