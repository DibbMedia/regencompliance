import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email"
import { betaWelcomeEmail } from "@/lib/email-templates"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const inviteToken = searchParams.get("invite_token")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      if (inviteToken) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const adminClient = createServiceClient()
          const { data: teamMember } = await adminClient
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

          const createdAt = new Date(teamMember.created_at).getTime()
          const seventyTwoHours = 72 * 60 * 60 * 1000
          if (Date.now() - createdAt > seventyTwoHours) {
            return NextResponse.redirect(
              `${origin}/login?error=invite_expired`
            )
          }

          await adminClient
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
        // ─── CLAIM BETA PURCHASE (non-blocking) ───
        // Fire and forget - don't slow down the redirect
        claimBetaPurchase(user.id, user.email).catch((err) =>
          console.error("Beta claim check failed (non-blocking):", err)
        )

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

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}

/** Non-blocking beta purchase claim - runs after redirect is issued */
async function claimBetaPurchase(userId: string, email: string | undefined) {
  const serviceClient = createServiceClient()
  const userEmail = email?.toLowerCase()

  if (!userEmail) return

  const { data: betaPurchase } = await serviceClient
    .from("beta_purchases")
    .select("id, stripe_customer_id")
    .eq("email", userEmail)
    .eq("claimed", false)
    .maybeSingle()

  if (!betaPurchase) return

  // Check if the webhook already activated this user (avoid duplicate email)
  const { data: existingProfile } = await serviceClient
    .from("profiles")
    .select("subscription_status, is_beta_subscriber, clinic_name")
    .eq("id", userId)
    .maybeSingle()

  const alreadyActivated = existingProfile?.is_beta_subscriber === true
    && existingProfile?.subscription_status === "active"

  if (alreadyActivated) return

  // Claim the beta purchase for this user
  await serviceClient
    .from("profiles")
    .update({
      subscription_status: "active",
      is_beta_subscriber: true,
      beta_enrolled_at: new Date().toISOString(),
      stripe_customer_id: betaPurchase.stripe_customer_id,
    })
    .eq("id", userId)

  await serviceClient
    .from("beta_purchases")
    .update({ claimed: true, claimed_by: userId })
    .eq("id", betaPurchase.id)

  await serviceClient.from("notifications").insert({
    profile_id: userId,
    title: "Beta Access Activated",
    body: "Your lifetime beta access to RegenCompliance is now active. Welcome aboard!",
    type: "billing",
    action_url: "/dashboard/scanner",
  })

  // Send beta welcome email (only if webhook didn't already)
  const clinicName = existingProfile?.clinic_name || "there"
  const template = betaWelcomeEmail(clinicName)
  await sendEmail(userEmail, template.subject, template.html)
}
