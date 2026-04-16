import { NextResponse } from "next/server"
import { verifyDeveloperAdmin } from "@/lib/admin"
import { isValidUUID } from "@/lib/validations"
import { logAudit, getRequestMeta } from "@/lib/audit-log"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifyDeveloperAdmin()
  if ("error" in auth) return auth.error
  const { user, serviceClient } = auth

  const { id } = await params
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Invalid admin ID" }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  if (!body?.role || (body.role !== "developer" && body.role !== "support")) {
    return NextResponse.json({ error: "role must be developer or support" }, { status: 400 })
  }

  const { data, error } = await serviceClient
    .from("platform_admins")
    .update({ role: body.role })
    .eq("id", id)
    .select("id, email, role")
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Not found" }, { status: 404 })
  }

  const { ip, userAgent } = getRequestMeta(request)
  logAudit({
    user_id: user.id,
    user_email: user.email,
    action: "admin.role.update",
    resource_type: "platform_admin",
    resource_id: id,
    details: { email: data.email, new_role: body.role },
    ip_address: ip,
    user_agent: userAgent,
  })

  return NextResponse.json({ admin: data })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifyDeveloperAdmin()
  if ("error" in auth) return auth.error
  const { user, serviceClient } = auth

  const { id } = await params
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Invalid admin ID" }, { status: 400 })
  }

  const { data: row } = await serviceClient
    .from("platform_admins")
    .select("email")
    .eq("id", id)
    .maybeSingle()

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (row.email === user.email) {
    return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 })
  }

  const { error } = await serviceClient.from("platform_admins").delete().eq("id", id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await serviceClient
    .from("impersonation_sessions")
    .delete()
    .eq("admin_email", row.email)

  const { ip, userAgent } = getRequestMeta(request)
  logAudit({
    user_id: user.id,
    user_email: user.email,
    action: "admin.role.revoke",
    resource_type: "platform_admin",
    resource_id: id,
    details: { email: row.email },
    ip_address: ip,
    user_agent: userAgent,
  })

  return NextResponse.json({ ok: true })
}
