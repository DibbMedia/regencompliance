import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { requireWriteMode } from "@/lib/impersonation"
import { checkRateLimit } from "@/lib/rate-limit"
import { logAudit } from "@/lib/audit-log"
import { sendToGhl } from "@/lib/ghl"
import { getProfile } from "@/lib/repos/profiles"
import { listTeamMembers } from "@/lib/repos/team-members"

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

  // Collect all user data. Wave 2A: profile + team_members run through the
  // repos so the export is decrypted plaintext (matches what the user sees
  // in the app); other tables remain plaintext until later waves.
  const [profile, scans, tickets, ticketMessages, notifications, teamMembers] = await Promise.all([
    getProfile(serviceClient, user.id),
    serviceClient.from("scans").select("*").eq("profile_id", user.id).order("created_at", { ascending: false }).then((r) => r.data),
    serviceClient.from("support_tickets").select("*").eq("profile_id", user.id).order("created_at", { ascending: false }).then((r) => r.data),
    serviceClient.from("ticket_messages").select("*, support_tickets!inner(profile_id)").eq("support_tickets.profile_id", user.id).order("created_at", { ascending: false }).then((r) => r.data),
    serviceClient.from("notifications").select("*").eq("profile_id", user.id).order("created_at", { ascending: false }).then((r) => r.data),
    listTeamMembers(serviceClient, user.id),
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

  // GHL fires a confirmation email if the operator wires the
  // regen-data-exported workflow. The user already has the export
  // downloaded by the time this runs - the email is informational.
  if (user.email) {
    void sendToGhl("data_exported", {
      email: user.email,
      company: profile?.clinic_name ?? null,
    })
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
