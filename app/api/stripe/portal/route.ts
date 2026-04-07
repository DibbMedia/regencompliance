import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, is_beta_subscriber")
      .eq("id", user.id)
      .single()

    if (profile?.is_beta_subscriber) {
      return NextResponse.json(
        { error: "Beta lifetime subscribers don't have a billing subscription to manage." },
        { status: 400 }
      )
    }

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No subscription found. Please subscribe first to access billing management." },
        { status: 400 }
      )
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/account`

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: returnUrl,
      })

      return NextResponse.json({ url: session.url })
    } catch (stripeError: unknown) {
      const message = stripeError instanceof Error ? stripeError.message : "Unknown Stripe error"
      console.error("Stripe portal session creation failed:", message)

      return NextResponse.json(
        { error: "Unable to access billing portal. Please contact support." },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Stripe portal error:", error)
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 })
  }
}
