// Token-based beta-purchase claim (plan §12.2). Replaces the previous
// email-based claim path which is impossible to support after Phase 6
// encryption made beta_purchases.email opaque.
//
// Body shape: { reservation_token: string }
//
// The route looks up the row by reservation_token (plaintext, UNIQUE per
// mig 028), flips claimed=true + claimed_by=<user.id> atomically via the
// repo's claimByReservationToken helper, then activates the user's profile
// + drops the welcome notification.
//
// All profile/notification side effects also live in /auth/callback's
// claim block (still STRICTLY DEFERRED for Wave 2E) - this endpoint is
// the safety net for the login-page fallback fetch.

import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { requireWriteMode } from "@/lib/impersonation"
import { claimByReservationToken } from "@/lib/repos/beta-purchases"
import { isValidUUID } from "@/lib/validations"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ claimed: false }, { status: 401 })
    }

    const blocked = await requireWriteMode()
    if (blocked) return blocked

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ claimed: false, error: "Invalid JSON" }, { status: 400 })
    }

    const token =
      body && typeof body === "object" && "reservation_token" in body
        ? (body as { reservation_token: unknown }).reservation_token
        : null

    if (typeof token !== "string" || !isValidUUID(token)) {
      return NextResponse.json(
        { claimed: false, error: "Invalid reservation_token" },
        { status: 400 },
      )
    }

    const serviceClient = createServiceClient()
    const result = await claimByReservationToken(serviceClient, token, user.id)

    if (!result.claimed) {
      // Distinct branches: not_found / already_claimed / expired. Don't
      // surface which to the client to avoid leaking reservation existence.
      return NextResponse.json({ claimed: false })
    }

    // Activate the user's subscription. Mirrors the side effects in
    // /auth/callback's beta claim block (Wave 2E deferred merge).
    await serviceClient
      .from("profiles")
      .update({
        subscription_status: "active",
        is_beta_subscriber: true,
        beta_enrolled_at: new Date().toISOString(),
        stripe_customer_id: result.row.stripe_customer_id,
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
