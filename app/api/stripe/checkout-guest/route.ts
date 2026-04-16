import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"

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
    const { allowed } = await checkRateLimit(`checkout:${ip}`, 10, 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many checkout requests. Please try again later." },
        { status: 429 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/login?subscribed=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      allow_promotion_codes: true,
      customer_creation: "always",
      metadata: { plan_type: "standard_monthly" },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Guest checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 })
  }
}
