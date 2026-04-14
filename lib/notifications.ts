import { createServiceClient } from "./supabase/server"

/**
 * Create a notification for ALL users (one row per user).
 * This replaces the old broadcast approach (profile_id=NULL) which couldn't
 * be marked read per-user due to RLS constraints.
 */
export async function createBroadcastNotification(
  title: string,
  body: string,
  type: string,
  actionUrl?: string
) {
  const supabase = createServiceClient()

  // Get all active profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id")

  if (!profiles || profiles.length === 0) return

  // Create one notification per user
  const rows = profiles.map((p) => ({
    profile_id: p.id,
    title,
    body,
    type,
    action_url: actionUrl || null,
  }))

  return supabase.from("notifications").insert(rows)
}

export async function createUserNotification(
  profileId: string,
  title: string,
  body: string,
  type: string,
  actionUrl?: string
) {
  const supabase = createServiceClient()
  return supabase.from("notifications").insert({
    profile_id: profileId,
    title,
    body,
    type,
    action_url: actionUrl,
  })
}

export async function createComplianceAlert(
  profileId: string,
  title: string,
  body: string,
  actionUrl: string,
  type?: string
): Promise<void> {
  const supabase = createServiceClient()
  await supabase.from("notifications").insert({
    profile_id: profileId,
    title,
    body,
    type: type || "enforcement",
    action_url: actionUrl,
  })
}
