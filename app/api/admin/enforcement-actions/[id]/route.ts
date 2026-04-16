import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import { isValidUUID } from "@/lib/validations"
import { logAudit, getRequestMeta } from "@/lib/audit-log"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error
  const { user, serviceClient } = auth

  const { id } = await params
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (body.is_published !== undefined) updates.is_published = !!body.is_published
  if (body.summary !== undefined) updates.summary = String(body.summary).slice(0, 2000)
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No changes" }, { status: 400 })
  }

  const { error } = await serviceClient
    .from("enforcement_actions")
    .update(updates)
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { ip, userAgent } = getRequestMeta(request)
  logAudit({
    user_id: user.id,
    user_email: user.email,
    action: "admin.enforcement_action.update",
    resource_type: "enforcement_action",
    resource_id: id,
    details: updates,
    ip_address: ip,
    user_agent: userAgent,
  })

  return NextResponse.json({ ok: true, updates })
}
