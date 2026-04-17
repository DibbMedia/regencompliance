import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { requireWriteMode } from "@/lib/impersonation"
import { sendEmail } from "@/lib/email"
import { dataExportEmail } from "@/lib/email-templates"
import { checkRateLimit } from "@/lib/rate-limit"
import { logAudit } from "@/lib/audit-log"

export async function POST() {
  try {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const blocked = await requireWriteMode()
  if (blocked) return blocked

  const { allowed } = await checkRateLimit(`export:${user.id}`, 5, 24 * 60 * 60 * 1000)
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded. Maximum 5 exports per day." }, { status: 429 })

  const serviceClient = createServiceClient()

  // Collect all user data
  const [
    { data: profile },
    { data: scans },
    { data: tickets },
    { data: ticketMessages },
    { data: notifications },
    { data: teamMembers },
  ] = await Promise.all([
    serviceClient.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    serviceClient.from("scans").select("*").eq("profile_id", user.id).order("created_at", { ascending: false }),
    serviceClient.from("support_tickets").select("*").eq("profile_id", user.id).order("created_at", { ascending: false }),
    serviceClient.from("ticket_messages").select("*, support_tickets!inner(profile_id)").eq("support_tickets.profile_id", user.id).order("created_at", { ascending: false }),
    serviceClient.from("notifications").select("*").eq("profile_id", user.id).order("created_at", { ascending: false }),
    serviceClient.from("team_members").select("*").eq("profile_id", user.id).order("invited_at", { ascending: false }),
  ])

  const exportData = {
    exported_at: new Date().toISOString(),
    user_id: user.id,
    email: user.email,
    profile,
    scans: scans || [],
    support_tickets: tickets || [],
    ticket_messages: ticketMessages || [],
    notifications: notifications || [],
    team_members: teamMembers || [],
  }

  // Send notification email
  if (user.email) {
    const clinicName = profile?.clinic_name || "there"
    const template = dataExportEmail(clinicName, "https://compliance.regenportal.com/dashboard/account")
    await sendEmail(user.email, template.subject, template.html)
  }

  logAudit({ user_id: user.id, user_email: user.email, action: "data.exported", resource_type: "profile" })

  const jsonStr = JSON.stringify(exportData, null, 2)

  return new NextResponse(jsonStr, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="regencompliance-data-export.json"',
    },
  })
  } catch (error) {
    console.error("[Export] Data export failed:", error)
    return NextResponse.json({ error: "Export failed. Please try again." }, { status: 500 })
  }
}
