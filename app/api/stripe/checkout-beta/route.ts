import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServiceClient } from "@/lib/supabase/server"

const BETA_SEAT_LIMIT = 25

// Simple in-memory rate limiter: max 10 checkout sessions per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }

  entry.count++
  return true
}

// Periodically clean stale entries to prevent memory leak
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetAt) {
      rateLimitMap.delete(key)
    }
  }
}, 10 * 60 * 1000)

export async function POST(request: Request) {
  try {
    // Origin / Referer validation
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

    // Rate limiting by IP
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown"

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many checkout requests. Please try again later." },
        { status: 429 }
      )
    }

    // Check beta seat availability
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

    // Also count unclaimed beta purchases (reserved but not yet linked to a profile)
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
      mode: "payment",
      line_items: [{ price: process.env.STRIPE_BETA_PRICE_ID!, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/login?beta=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: { plan_type: "beta_lifetime" },
      payment_intent_data: {
        metadata: { plan_type: "beta_lifetime" },
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
