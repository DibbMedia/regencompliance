import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ claimed: false }, { status: 401 })
    }

    const serviceClient = createServiceClient()
    const userEmail = user.email.toLowerCase()

    // Check for unclaimed beta purchase matching this email
    const { data: betaPurchase } = await serviceClient
      .from("beta_purchases")
      .select("id, stripe_customer_id")
      .eq("email", userEmail)
      .eq("claimed", false)
      .maybeSingle()

    if (!betaPurchase) {
      return NextResponse.json({ claimed: false })
    }

    // Claim the beta purchase
    await serviceClient
      .from("profiles")
      .update({
        subscription_status: "active",
        is_beta_subscriber: true,
        beta_enrolled_at: new Date().toISOString(),
        stripe_customer_id: betaPurchase.stripe_customer_id,
      })
      .eq("id", user.id)

    await serviceClient
      .from("beta_purchases")
      .update({ claimed: true, claimed_by: user.id })
      .eq("id", betaPurchase.id)

    await serviceClient.from("notifications").insert({
      profile_id: user.id,
      title: "Beta Access Activated",
      body: "Your lifetime beta access to RegenCompliance is now active. Welcome aboard!",
      type: "billing",
      action_url: "/dashboard/scanner",
    })

    return NextResponse.json({ claimed: true })
  } catch (error) {
    console.error("Beta claim error:", error)
    return NextResponse.json({ error: "Failed to claim beta" }, { status: 500 })
  }
}
