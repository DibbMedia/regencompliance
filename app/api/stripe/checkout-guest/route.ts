import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"
import { appUrl, marketingUrl } from "@/lib/site-url"

export async function POST(request: Request) {
  try {
    // Origin enforcement is handled centrally by proxy.ts middleware via
    // lib/security/origin.ts, which allows both the marketing apex (where
    // the public pricing page POSTs from) and the app subdomain.
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
      success_url: appUrl("/login?subscribed=true"),
      cancel_url: marketingUrl("/"),
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
