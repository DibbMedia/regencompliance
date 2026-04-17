import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { requireWriteMode } from "@/lib/impersonation"
import { stripe } from "@/lib/stripe"
import { sendEmail } from "@/lib/email"
import { accountDeletedEmail } from "@/lib/email-templates"
import { logAudit, getRequestMeta } from "@/lib/audit-log"

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

  // Get profile for Stripe info and email template
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("clinic_name, stripe_subscription_id, stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle()

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

    if (userEmail) {
      await serviceClient.from("audit_log").update({ user_email: null }).eq("user_email", userEmail)
    }

    const { error: authDeleteError } = await serviceClient.auth.admin.deleteUser(user.id)
    if (authDeleteError) {
      console.error("[Delete] Auth user deletion failed:", authDeleteError)
    }

    // 8. Send confirmation email (best-effort, account is already gone)
    if (userEmail) {
      const template = accountDeletedEmail(clinicName)
      await sendEmail(userEmail, template.subject, template.html)
    }

    logAudit({ user_id: user.id, user_email: user.email, action: "account.deleted", details: { clinic_name: clinicName }, ip_address: ip, user_agent: userAgent })
    return NextResponse.json({ success: true, message: "Account and all data deleted." })
  } catch (error) {
    console.error("[Delete] Account deletion failed:", error)
    logAudit({ user_id: user.id, user_email: user.email, action: "account.delete.failed", status: "error", ip_address: ip, user_agent: userAgent })
    return NextResponse.json({ error: "Account deletion failed. Please contact support." }, { status: 500 })
  }
}
