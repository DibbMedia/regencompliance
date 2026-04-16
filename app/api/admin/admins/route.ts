import { NextResponse } from "next/server"
import { verifyAdmin, verifyDeveloperAdmin } from "@/lib/admin"
import { logAudit, getRequestMeta } from "@/lib/audit-log"

export async function GET() {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error
  const { serviceClient } = auth

  const { data, error } = await serviceClient
    .from("platform_admins")
    .select("id, email, role, added_by, added_at")
    .order("added_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ admins: data ?? [] })
}

export async function POST(request: Request) {
  const auth = await verifyDeveloperAdmin()
  if ("error" in auth) return auth.error
  const { user, serviceClient } = auth

  const body = await request.json().catch(() => null)
  if (!body?.email || !body?.role) {
    return NextResponse.json({ error: "email and role required" }, { status: 400 })
  }
  if (body.role !== "developer" && body.role !== "support") {
    return NextResponse.json({ error: "role must be developer or support" }, { status: 400 })
  }

  const email = String(body.email).toLowerCase().trim()

  const { data, error } = await serviceClient
    .from("platform_admins")
    .insert({ email, role: body.role, added_by: user.email ?? "unknown" })
    .select("id, email, role, added_by, added_at")
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Email already an admin" }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { ip, userAgent } = getRequestMeta(request)
  logAudit({
    user_id: user.id,
    user_email: user.email,
    action: "admin.role.grant",
    resource_type: "platform_admin",
    resource_id: data.id,
    details: { email, role: body.role },
    ip_address: ip,
    user_agent: userAgent,
  })

  return NextResponse.json({ admin: data })
}
