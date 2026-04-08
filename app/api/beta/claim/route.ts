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

    // Atomically claim: only succeeds if not already claimed
    const { data: betaPurchase, error: claimError } = await serviceClient
      .from("beta_purchases")
      .update({ claimed: true, claimed_by: user.id })
      .eq("email", userEmail)
      .eq("claimed", false)
      .select("id, stripe_customer_id")
      .single()

    if (claimError || !betaPurchase) {
      // Either no matching purchase or already claimed
      return NextResponse.json({ claimed: false })
    }

    // Activate the user's subscription
    await serviceClient
      .from("profiles")
      .update({
        subscription_status: "active",
        is_beta_subscriber: true,
        beta_enrolled_at: new Date().toISOString(),
        stripe_customer_id: betaPurchase.stripe_customer_id,
      })
      .eq("id", user.id)

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
