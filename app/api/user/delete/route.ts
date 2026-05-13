import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { requireWriteMode } from "@/lib/impersonation"
import { stripe } from "@/lib/stripe"
import { logAudit, getRequestMeta } from "@/lib/audit-log"
import { sendToGhl } from "@/lib/ghl"
import { getProfile } from "@/lib/repos/profiles"
import { anonymizeAuditLogForUser } from "@/lib/repos/audit-log"

export async function POST(request: Request) {
  const { ip, userAgent } = getRequestMeta(request)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    logAudit({ action: "account.delete.attempt", status: "failure", details: { reason: "unauthenticated" }, ip_address: ip, user_agent: userAgent })
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const blocked = await requireWriteMode()
  if (blocked) return blocked

  // Require explicit confirmation
  let body: { confirm?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (body.confirm !== true) {
    return NextResponse.json({ error: "Confirmation required. Send { confirm: true } to proceed." }, { status: 400 })
  }

  const serviceClient = createServiceClient()

  // Get profile for Stripe info and email template. Wave 2A: clinic_name is
  // encrypted - the repo decrypts it under the user's DEK BEFORE we delete
  // the row (and thus before crypto-shredding the DEK is implicit through
  // master-key-only retention).
  const profile = await getProfile(serviceClient, user.id)

  const clinicName = profile?.clinic_name || "there"
  const userEmail = user.email

  try {
    // 1. Cancel Stripe subscription if active
    if (profile?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(profile.stripe_subscription_id)
        console.log(`[Delete] Cancelled Stripe subscription ${profile.stripe_subscription_id}`)
      } catch (stripeErr) {
        console.error("[Delete] Stripe cancellation failed (continuing):", stripeErr)
      }
    }

    // 1b. Null beta_purchases.claimed_by ahead of profile delete - migration 026
    // sets ON DELETE SET NULL for the FK, but doing it explicitly here keeps
    // the row's claim history visible (vs the auth user vanishing under it).
    await serviceClient
      .from("beta_purchases")
      .update({ claimed_by: null })
      .eq("claimed_by", user.id)

    // 1c. Purge user-keyed rate-limit rows (PII: user uuid in the key string)
    await serviceClient.from("rate_limits").delete().like("key", `%${user.id}%`)

    // 2. Delete all user's scans
    await serviceClient.from("scans").delete().eq("profile_id", user.id)

    // 3. Delete all user's ticket messages, then tickets
    // First get ticket IDs to delete messages
    const { data: tickets } = await serviceClient
      .from("support_tickets")
      .select("id")
      .eq("profile_id", user.id)

    if (tickets && tickets.length > 0) {
      const ticketIds = tickets.map((t) => t.id)
      await serviceClient.from("ticket_messages").delete().in("ticket_id", ticketIds)
      await serviceClient.from("support_tickets").delete().eq("profile_id", user.id)
    }

    // 3b. Delete API usage records
    await serviceClient.from("api_usage").delete().eq("user_id", user.id)

    // 4. Delete all user's notifications
    await serviceClient.from("notifications").delete().eq("profile_id", user.id)

    // 5. Delete team members
    await serviceClient.from("team_members").delete().eq("profile_id", user.id)

    // 6. Delete profile
    await serviceClient.from("profiles").delete().eq("id", user.id)

    // GDPR right-to-be-forgotten: re-key the user's audit-log rows so their
    // free-text columns (user_email, ip_address, user_agent, details) are
    // no longer recoverable under a soon-to-be-shredded user DEK. The
    // user_id column stays plaintext (UUID, not PII on its own) so the
    // audit trail still exists for compliance investigations.
    await anonymizeAuditLogForUser(serviceClient, user.id)

    const { error: authDeleteError } = await serviceClient.auth.admin.deleteUser(user.id)
    if (authDeleteError) {
      console.error("[Delete] Auth user deletion failed:", authDeleteError)
    }

    // 8. GHL fires the deletion confirmation email (Resend path is deprecated).
    // Best-effort - account is already gone so failures here can't roll
    // anything back.
    if (userEmail) {
      void sendToGhl("account_deleted", {
        email: userEmail,
        company: clinicName === "there" ? null : clinicName,
      })
    }

    logAudit({ user_id: user.id, user_email: user.email, action: "account.deleted", details: { clinic_name: clinicName }, ip_address: ip, user_agent: userAgent })
    return NextResponse.json({ success: true, message: "Account and all data deleted." })
  } catch (error) {
    console.error("[Delete] Account deletion failed:", error)
    logAudit({ user_id: user.id, user_email: user.email, action: "account.delete.failed", status: "error", ip_address: ip, user_agent: userAgent })
    return NextResponse.json({ error: "Account deletion failed. Please contact support." }, { status: 500 })
  }
}
