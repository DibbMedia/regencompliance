import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  // One-time migration: convert broadcast notifications (profile_id=NULL) to per-user copies
  const secret = request.headers.get("x-migrate-secret")
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Get all broadcast notifications
  const { data: broadcasts, error: bErr } = await supabase
    .from("notifications")
    .select("*")
    .is("profile_id", null)

  if (bErr) {
    return NextResponse.json({ error: "Failed to fetch broadcasts", detail: bErr.message }, { status: 500 })
  }

  if (!broadcasts || broadcasts.length === 0) {
    return NextResponse.json({ success: true, message: "No broadcasts to migrate", converted: 0 })
  }

  // Get all profiles
  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("id")

  if (pErr || !profiles) {
    return NextResponse.json({ error: "Failed to fetch profiles", detail: pErr?.message }, { status: 500 })
  }

  // Create per-user copies of each broadcast
  const rows = []
  for (const b of broadcasts) {
    for (const p of profiles) {
      rows.push({
        profile_id: p.id,
        title: b.title,
        body: b.body,
        type: b.type,
        action_url: b.action_url,
        read: false,
        created_at: b.created_at,
      })
    }
  }

  if (rows.length > 0) {
    const { error: insertErr } = await supabase.from("notifications").insert(rows)
    if (insertErr) {
      return NextResponse.json({ error: "Failed to insert copies", detail: insertErr.message }, { status: 500 })
    }
  }

  // Delete original broadcasts
  const broadcastIds = broadcasts.map((b) => b.id)
  const { error: delErr } = await supabase
    .from("notifications")
    .delete()
    .in("id", broadcastIds)

  if (delErr) {
    return NextResponse.json({
      success: true,
      warning: "Copies created but failed to delete originals: " + delErr.message,
      converted: rows.length,
    })
  }

  return NextResponse.json({
    success: true,
    broadcasts_found: broadcasts.length,
    profiles_found: profiles.length,
    copies_created: rows.length,
    originals_deleted: broadcastIds.length,
  })
}
