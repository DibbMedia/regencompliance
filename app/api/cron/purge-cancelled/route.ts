export const maxDuration = 60

import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { isCronAuthorized } from "@/lib/cron-auth"
import { logAudit } from "@/lib/audit-log"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (!isCronAuthorized(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServiceClient()
  // 30-day grace from the actual cancellation. Pre-2026-05-05 this used
  // profiles.updated_at, which any profile edit reset - so an admin's
  // metadata tweak could trigger a premature delete. Migration 029 added
  // an explicit cancelled_at column the Stripe webhook stamps.
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: toDelete, error: fetchErr } = await supabase
    .from("profiles")
    .select("id, cancelled_at, subscription_status")
    .eq("subscription_status", "cancelled")
    .not("cancelled_at", "is", null)
    .lt("cancelled_at", cutoff)
    .limit(100)

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  }

  let deleted = 0
  let failed = 0
  for (const row of toDelete ?? []) {
    const { error } = await supabase.auth.admin.deleteUser(row.id)
    if (error) {
      console.error(`[purge-cancelled] failed to delete ${row.id}:`, error)
      failed++
      continue
    }
    deleted++
    // Audit trail so a deleted account is at least visible in the log even
    // after the auth row is gone.
    logAudit({
      user_id: row.id,
      action: "account.purged",
      resource_type: "profile",
      resource_id: row.id,
      details: { reason: "cancelled-30d-cutoff", cancelled_at: row.cancelled_at },
    })
  }

  return NextResponse.json({ deleted, failed, checked: toDelete?.length ?? 0 })
}
