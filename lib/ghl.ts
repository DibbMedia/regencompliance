/**
 * GoHighLevel (GHL) workflow webhook integration.
 *
 * Each event type maps to its own env var holding a GHL workflow webhook URL.
 * Missing env = warning + no-op (so paid-beta launch can ship before all GHL
 * workflows are wired). Failures never throw — business flows must not break
 * on a GHL outage.
 *
 * Env vars to set in Vercel (operator action — fill in as workflows are built):
 *   GHL_WEBHOOK_SIGNUP                  - new account signup
 *   GHL_WEBHOOK_BETA_APPLY              - beta-tester application submitted
 *   GHL_WEBHOOK_WAITLIST                - public waitlist signup
 *   GHL_WEBHOOK_FREE_AUDIT              - lead-magnet free-audit submission
 *   GHL_WEBHOOK_SUBSCRIPTION_ACTIVE     - paid subscription activated (any tier)
 *   GHL_WEBHOOK_SUBSCRIPTION_CANCELLED  - subscription cancelled
 *   GHL_WEBHOOK_PAYMENT_FAILED          - invoice payment failed
 *   GHL_WEBHOOK_ACCOUNT_DELETED         - account deletion confirmed
 *
 * GHL webhooks are configured per-workflow on the "Inbound Webhook" trigger
 * inside the GHL workflow builder. Copy the webhook URL into the matching
 * env var and the corresponding code path will start firing.
 */

export type GhlEvent =
  | "signup"
  | "beta_apply"
  | "waitlist"
  | "free_audit"
  | "subscription_active"
  | "subscription_cancelled"
  | "payment_failed"
  | "account_deleted"

const ENV_KEYS: Record<GhlEvent, string> = {
  signup: "GHL_WEBHOOK_SIGNUP",
  beta_apply: "GHL_WEBHOOK_BETA_APPLY",
  waitlist: "GHL_WEBHOOK_WAITLIST",
  free_audit: "GHL_WEBHOOK_FREE_AUDIT",
  subscription_active: "GHL_WEBHOOK_SUBSCRIPTION_ACTIVE",
  subscription_cancelled: "GHL_WEBHOOK_SUBSCRIPTION_CANCELLED",
  payment_failed: "GHL_WEBHOOK_PAYMENT_FAILED",
  account_deleted: "GHL_WEBHOOK_ACCOUNT_DELETED",
}

export interface GhlContact {
  email: string
  name?: string | null
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  company?: string | null
  /** Arbitrary custom fields surfaced to GHL workflow as JSON */
  [key: string]: unknown
}

const TIMEOUT_MS = 5000

/**
 * Send an event payload to the matching GHL workflow webhook. Fire-and-forget;
 * never throws. Caller pattern: `void sendToGhl("signup", { email })`.
 */
export async function sendToGhl(event: GhlEvent, contact: GhlContact): Promise<void> {
  const envKey = ENV_KEYS[event]
  const url = process.env[envKey]?.trim()

  if (!url) {
    console.warn(`[GHL] ${envKey} not set, skipping ${event}`)
    return
  }

  // Best-effort split of `name` into first/last when not provided explicitly.
  // Saves the operator from configuring GHL's contact-name parser per event.
  let firstName = contact.first_name ?? null
  let lastName = contact.last_name ?? null
  if (!firstName && contact.name) {
    const parts = String(contact.name).trim().split(/\s+/)
    firstName = parts[0] ?? null
    lastName = parts.length > 1 ? parts.slice(1).join(" ") : null
  }

  const payload = {
    ...contact,
    first_name: firstName,
    last_name: lastName,
    event,
    source: "regencompliance",
    timestamp: new Date().toISOString(),
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) {
      console.error(`[GHL] ${event} webhook returned ${res.status}`)
    }
  } catch (e) {
    console.error(`[GHL] ${event} webhook error:`, e)
  }
}
