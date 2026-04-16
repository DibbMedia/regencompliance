import { NextResponse } from "next/server"
import { verifyAdmin, verifyDeveloperAdmin } from "@/lib/admin"
import { isValidUUID } from "@/lib/validations"
import { logAudit, getRequestMeta } from "@/lib/audit-log"

const ALLOWED_STATUSES = ["active", "inactive", "past_due", "cancelled"] as const

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifyDeveloperAdmin()
  if ("error" in auth) return auth.error
  const { user, serviceClient } = auth

  const { id } = await params
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (body.subscription_status !== undefined) {
    if (!ALLOWED_STATUSES.includes(body.subscription_status)) {
      return NextResponse.json({ error: "Invalid subscription_status" }, { status: 400 })
    }
    updates.subscription_status = body.subscription_status
  }
  if (body.is_beta_subscriber !== undefined) {
    updates.is_beta_subscriber = !!body.is_beta_subscriber
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No changes" }, { status: 400 })
  }

  const { error } = await serviceClient.from("profiles").update(updates).eq("id", id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { ip, userAgent } = getRequestMeta(request)
  logAudit({
    user_id: user.id,
    user_email: user.email,
    action: "admin.user.update",
    resource_type: "user",
    resource_id: id,
    details: updates,
    ip_address: ip,
    user_agent: userAgent,
  })

  return NextResponse.json({ ok: true, updates })
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
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
  }

  const { error } = await serviceClient.auth.admin.deleteUser(id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { ip, userAgent } = getRequestMeta(request)
  logAudit({
    user_id: user.id,
    user_email: user.email,
    action: "admin.user.delete",
    resource_type: "user",
    resource_id: id,
    ip_address: ip,
    user_agent: userAgent,
  })

  return NextResponse.json({ ok: true })
}
