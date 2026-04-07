import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email"
import { dataExportEmail } from "@/lib/email-templates"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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

  const jsonStr = JSON.stringify(exportData, null, 2)

  return new NextResponse(jsonStr, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="regencompliance-data-export.json"',
    },
  })
}
