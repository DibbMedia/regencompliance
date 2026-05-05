export const maxDuration = 60

import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { isCronAuthorized } from "@/lib/cron-auth"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (!isCronAuthorized(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServiceClient()
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: toDelete, error: fetchErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("subscription_status", "cancelled")
    .lt("updated_at", cutoff)
    .limit(100)

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  }

  let deleted = 0
  for (const row of toDelete ?? []) {
    const { error } = await supabase.auth.admin.deleteUser(row.id)
    if (!error) deleted++
  }

  return NextResponse.json({ deleted, checked: toDelete?.length ?? 0 })
}
