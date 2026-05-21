import { NextResponse } from "next/server"
import { verifyDeveloperAdmin } from "@/lib/admin"
import { isValidUUID } from "@/lib/validations"
import { logAudit, getRequestMeta } from "@/lib/audit-log"
import { deleteAllSessionsForAdmin } from "@/lib/repos/impersonation-sessions"
import { hasFreshStepUp, stepUpRequired } from "@/lib/admin/step-up"
import { extractJustification } from "@/lib/admin/justification"

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
    if (error) console.error("[admin/admins PATCH] database error:", error)
    return NextResponse.json({ error: "Admin not found or update failed" }, { status: 404 })
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

  // Step-up gate: removing a platform admin is destructive and irreversible.
  // Require a fresh re-auth cookie that was issued for THIS admin (prevents
  // cookie reuse across admins), regardless of how recent the normal session
  // is. Mirrors the DELETE /api/admin/users/[id] gate.
  if (!(await hasFreshStepUp(request, user.id))) {
    const r = stepUpRequired()
    return NextResponse.json(r.body, { status: r.status })
  }

  const { id } = await params
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Invalid admin ID" }, { status: 400 })
  }

  // Justification gate. DELETE traditionally carries no body, but Next.js
  // permits one and the admin UI sends `{ justification }` as JSON. If the
  // body is missing or unparseable we fail closed with the standard 400.
  const body = await request.json().catch(() => null)
  const justCheck = extractJustification(body)
  if (!justCheck.ok) {
    return NextResponse.json(justCheck.error!.body, { status: justCheck.error!.status })
  }
  const justification = justCheck.justification!

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
    console.error("[admin/admins DELETE] database error:", error)
    return NextResponse.json({ error: "Failed to remove admin" }, { status: 500 })
  }

  // impersonation_sessions.admin_email is dropped post migration 040; the
  // repo deletes by `admin_user_id` instead. Resolve the admin's user_id
  // via the indexed RPC (mig 030); platform_admins stores email, not
  // user_id. Skip the delete cleanly if the admin had never logged in
  // (no matching auth.users row).
  try {
    const { data: adminUserId } = await serviceClient.rpc(
      "find_auth_user_id_by_email",
      { p_email: row.email },
    )
    if (typeof adminUserId === "string" && adminUserId.length > 0) {
      await deleteAllSessionsForAdmin(serviceClient, adminUserId)
    }
  } catch (sessErr) {
    console.error("[admin/admins DELETE] session cleanup failed:", sessErr)
  }

  const { ip, userAgent } = getRequestMeta(request)
  logAudit({
    user_id: user.id,
    user_email: user.email,
    action: "admin.role.revoke",
    resource_type: "platform_admin",
    resource_id: id,
    details: { email: row.email, target_admin_id: id, justification },
    ip_address: ip,
    user_agent: userAgent,
  })

  return NextResponse.json({ ok: true })
}
