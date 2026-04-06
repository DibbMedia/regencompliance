import { createServiceClient } from "./supabase/server"

export async function createBroadcastNotification(
  title: string,
  body: string,
  type: string,
  actionUrl?: string
) {
  const supabase = createServiceClient()
  return supabase.from("notifications").insert({
    profile_id: null,
    title,
    body,
    type,
    action_url: actionUrl,
  })
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
