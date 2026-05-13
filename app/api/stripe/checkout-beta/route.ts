import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { stripe } from "@/lib/stripe"
import { createServiceClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"
import { appUrl, marketingUrl } from "@/lib/site-url"

const BETA_SEAT_LIMIT = 25

export async function POST(request: Request) {
  try {
    // Origin enforcement is handled centrally by proxy.ts middleware via
    // lib/security/origin.ts, which allows both the marketing apex (where
    // the public /apply page POSTs from) and the app subdomain.
    const ip = getClientIp(request)
    const { allowed } = await checkRateLimit(`checkout-beta:${ip}`, 10, 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many checkout requests. Please try again later." },
        { status: 429 }
      )
    }

    const supabase = createServiceClient()

    // Atomic count + reserve (migration 028). Pre-2026-05-05 the route counted
    // taken + pending serially and then created the Stripe session - two
    // parallel requests could both pass the < limit check before either's
    // beta_purchases row landed, leading to oversell. The RPC wraps the count
    // and placeholder insert in an advisory lock so only one caller wins.
    const reservationToken = randomUUID()
    const { data: rpcRows, error: reserveError } = await supabase.rpc("reserve_beta_seat", {
      p_token: reservationToken,
      p_limit: BETA_SEAT_LIMIT,
    })

    if (reserveError) {
      console.error("[checkout-beta] reserve_beta_seat error:", reserveError)
      return NextResponse.json({ error: "Failed to check beta availability" }, { status: 500 })
    }

    const row = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows
    const reserved: boolean = row?.reserved === true
    const taken: number = Number(row?.taken_count ?? 0)
    const pending: number = Number(row?.pending_count ?? 0)

    if (!reserved) {
      return NextResponse.json(
        { error: "Beta spots are full", spots_remaining: 0 },
        { status: 409 },
      )
    }

    let session
    try {
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: process.env.STRIPE_BETA_PRICE_ID!, quantity: 1 }],
        // success_url passes the reservation_token forward so the signup
        // page can stash it in a short-lived cookie (rc_beta_claim) before
        // the user lands on email verification. /auth/callback then reads
        // the cookie to claim the beta_purchases row by token instead of by
        // email (plan §12.2). Email-based claim is dead.
        success_url: appUrl(`/login?beta=true&claim=${reservationToken}`),
        cancel_url: marketingUrl("/pricing"),
        metadata: { plan_type: "beta_subscription", reservation_token: reservationToken },
        subscription_data: {
          metadata: { plan_type: "beta_subscription", reservation_token: reservationToken },
        },
      })
    } catch (stripeErr) {
      // Release the reservation so we don't burn a seat on a failed Stripe call.
      await supabase.from("beta_purchases").delete().eq("reservation_token", reservationToken)
      throw stripeErr
    }

    if (!session.url) {
      await supabase.from("beta_purchases").delete().eq("reservation_token", reservationToken)
      return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 })
    }

    return NextResponse.json({
      url: session.url,
      spots_remaining: Math.max(0, BETA_SEAT_LIMIT - (taken + pending)),
    })
  } catch (error) {
    console.error("Beta checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 })
  }
}
