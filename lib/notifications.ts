// Notifications helper module — thin adapter over lib/repos/notifications.ts.
//
// Wave 2C swap: the previous implementation wrote plaintext directly to the
// notifications table. Post-migration 037, every notification row carries
// per-user encrypted envelopes for title/body/action_url, so all writes flow
// through the encrypted repo helpers.
//
// Signatures are preserved so existing callers (cron jobs, scan routes, etc.)
// keep working without edits.
import { createServiceClient } from "./supabase/server"
import {
  createNotification,
  createUserNotificationBulk,
  type NotificationWrite,
} from "./repos/notifications"

/**
 * Create a notification for ALL active users (one row per user).
 * Fans out via the encrypted repo, so every fan-out row gets its own envelope
 * bound to that profile's tenant key.
 */
export async function createBroadcastNotification(
  title: string,
  body: string,
  type: string,
  actionUrl?: string,
) {
  const supabase = createServiceClient()

  const { data: profiles } = await supabase.from("profiles").select("id")
  if (!profiles || profiles.length === 0) return

  const input: NotificationWrite = {
    title,
    body,
    type,
    action_url: actionUrl ?? null,
  }
  const items = profiles.map((p: { id: string }) => ({
    profileId: p.id,
    input,
  }))

  return createUserNotificationBulk(supabase, items)
}

/**
 * Create a single notification for one user.
 */
export async function createUserNotification(
  profileId: string,
  title: string,
  body: string,
  type: string,
  actionUrl?: string,
) {
  const supabase = createServiceClient()
  return createNotification(supabase, profileId, {
    title,
    body,
    type,
    action_url: actionUrl ?? null,
  })
}

/**
 * Compliance-alert convenience wrapper. Fixes the type to "compliance_alert".
 */
export async function createComplianceAlert(
  profileId: string,
  title: string,
  body: string,
  actionUrl: string,
  type?: string,
): Promise<void> {
  const supabase = createServiceClient()
  await createNotification(supabase, profileId, {
    title,
    body,
    type: type || "compliance_alert",
    action_url: actionUrl,
  })
}
