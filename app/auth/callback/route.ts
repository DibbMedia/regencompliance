import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { sendToGhl } from "@/lib/ghl"
import { getProfile } from "@/lib/repos/profiles"
import { createNotification } from "@/lib/repos/notifications"
import {
  claimByReservationToken,
} from "@/lib/repos/beta-purchases"
import {
  acceptInvite,
  decryptTeamMemberRow,
  type TeamMemberEncryptedRow,
} from "@/lib/repos/team-members"
import { isValidUUID } from "@/lib/validations"

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

          // Phase 2 (team_members encryption): the on-disk `email` column is
          // gone after migration 034; the encrypted `email_enc` envelope is
          // bound to the row's id + profile_id. We need both the decrypted
          // email (to verify the invitee owns the auth account) AND the
          // invited_at timestamp (for the 72-hour expiry window). Pull the
          // raw row with the repo's encrypted shape, decrypt under the
          // owning profile's DEK, then call acceptInvite to flip the row.
          const SELECT =
            "id, profile_id, user_id, email_enc, email, role, invite_token, " +
            "accepted, accepted_at, invited_at"
          const { data: rawRow } = await adminClient
            .from("team_members")
            .select(SELECT)
            .eq("invite_token", inviteToken)
            .eq("accepted", false)
            .maybeSingle()

          if (!rawRow) {
            return NextResponse.redirect(
              `${origin}/login?error=invite_email_mismatch`
            )
          }

          const row = rawRow as unknown as TeamMemberEncryptedRow
          let teamMember
          try {
            teamMember = decryptTeamMemberRow(row.profile_id, row)
          } catch (decryptErr) {
            console.error(
              "[auth/callback] team_members decrypt failed:",
              decryptErr,
            )
            return NextResponse.redirect(
              `${origin}/login?error=invite_email_mismatch`
            )
          }

          if (teamMember.email !== user.email) {
            return NextResponse.redirect(
              `${origin}/login?error=invite_email_mismatch`
            )
          }

          // 72-hour invite expiry. Pre-2026-05-05 this read team_members.created_at,
          // which doesn't exist - so Date.now() - NaN was always false and tokens
          // never expired. The actual column is invited_at (migration 001:62).
          const invitedAt = new Date(teamMember.invited_at).getTime()
          const seventyTwoHours = 72 * 60 * 60 * 1000
          if (Number.isNaN(invitedAt) || Date.now() - invitedAt > seventyTwoHours) {
            return NextResponse.redirect(
              `${origin}/login?error=invite_expired`
            )
          }

          try {
            await acceptInvite(adminClient, inviteToken, user.id)
          } catch (acceptErr) {
            console.error("[auth/callback] acceptInvite failed:", acceptErr)
            return NextResponse.redirect(
              `${origin}/login?error=invite_email_mismatch`
            )
          }

          return NextResponse.redirect(`${origin}/dashboard/scanner`)
        }
      }

      // Check if onboarding is complete
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Beta reservation_token claim (plan §12.2). The login page set
        // rc_beta_claim from ?claim=<token> on the Stripe success_url. Read
        // it here (server-side cookie store), call the token-based repo
        // claim, and clear the cookie. Email-based claim is dead -
        // beta_purchases.email is encrypted ciphertext post-Phase 6.
        try {
          const cookieStore = await cookies()
          const claimToken = cookieStore.get("rc_beta_claim")?.value
          if (claimToken && isValidUUID(claimToken)) {
            const adminClient = createServiceClient()
            const result = await claimByReservationToken(adminClient, claimToken, user.id)
            if (result.claimed) {
              await adminClient
                .from("profiles")
                .update({
                  subscription_status: "active",
                  is_beta_subscriber: true,
                  beta_enrolled_at: new Date().toISOString(),
                  stripe_customer_id: result.row.stripe_customer_id,
                })
                .eq("id", user.id)

              await createNotification(adminClient, user.id, {
                title: "Beta Access Activated",
                body: "Your lifetime beta access to RegenCompliance is now active. Welcome aboard!",
                type: "billing",
                action_url: "/dashboard/scanner",
              })

              // GHL beta-activation event - mirrors the Stripe webhook path;
              // dedup at the workflow level via stripe_customer_id.
              const betaProfile = await getProfile(adminClient, user.id)
              void sendToGhl("subscription_active", {
                email: user.email ?? "",
                company: betaProfile?.clinic_name ?? null,
                tier: "beta",
                monthly_price_cents: 29700,
                subscription_status: "active",
                subscription_started_at: new Date().toISOString(),
                stripe_customer_id: result.row.stripe_customer_id ?? "",
              })
            }
          }
        } catch (err) {
          console.error("Beta claim by token failed:", err)
        } finally {
          // Clear the cookie regardless of outcome - either we claimed
          // (success path) or the claim failed (don't retry on every
          // callback hit).
          try {
            const cookieStore = await cookies()
            cookieStore.delete("rc_beta_claim")
          } catch {}
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

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
