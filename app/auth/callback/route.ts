import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const inviteToken = searchParams.get("invite_token")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Handle team invite acceptance
      if (inviteToken) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Verify the authenticated user's email matches the invite and it hasn't expired
          const { data: teamMember } = await supabase
            .from("team_members")
            .select("email, created_at")
            .eq("invite_token", inviteToken)
            .eq("accepted", false)
            .maybeSingle()

          if (!teamMember || teamMember.email !== user.email) {
            return NextResponse.redirect(
              `${origin}/login?error=invite_email_mismatch`
            )
          }

          // Check 72-hour expiry window
          const createdAt = new Date(teamMember.created_at).getTime()
          const seventyTwoHours = 72 * 60 * 60 * 1000
          if (Date.now() - createdAt > seventyTwoHours) {
            return NextResponse.redirect(
              `${origin}/login?error=invite_expired`
            )
          }

          await supabase
            .from("team_members")
            .update({
              user_id: user.id,
              accepted: true,
              accepted_at: new Date().toISOString(),
            })
            .eq("invite_token", inviteToken)

          return NextResponse.redirect(`${origin}/dashboard/scanner`)
        }
      }

      // Check if onboarding is complete
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // ─── CLAIM BETA PURCHASE ───
        // Use service client for beta_purchases (RLS blocks anon access)
        try {
          const serviceClient = createServiceClient()
          const userEmail = user.email?.toLowerCase()

          if (userEmail) {
            const { data: betaPurchase } = await serviceClient
              .from("beta_purchases")
              .select("id, stripe_customer_id")
              .eq("email", userEmail)
              .eq("claimed", false)
              .maybeSingle()

            if (betaPurchase) {
              // Claim the beta purchase for this user
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
            }
          }
        } catch (betaErr) {
          console.error("Beta claim check failed (non-blocking):", betaErr)
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_complete")
          .eq("id", user.id)
          .single()

        if (profile && !profile.onboarding_complete) {
          return NextResponse.redirect(`${origin}/onboarding/clinic`)
        }
      }

      return NextResponse.redirect(`${origin}/dashboard/scanner`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
