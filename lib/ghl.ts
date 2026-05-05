/**
 * GoHighLevel (GHL) Private Integration client.
 *
 * Replaces the per-event webhook URL pattern with a single PIT (Private
 * Integration Token) that calls GHL's Contacts API directly. Every event
 * upserts the contact by email, applies event-specific tags, and populates
 * custom fields. GHL workflows then trigger off tag-add or custom-field
 * changes - more flexible than inbound-webhook triggers, and the data is
 * persisted on the contact record so downstream automations can branch on it.
 *
 * Env vars (operator action):
 *   GHL_API_TOKEN     - Private Integration Token (Bearer)
 *   GHL_LOCATION_ID   - GHL sub-account / location UUID
 *
 * PIT scopes required:
 *   - contacts.write
 *   - contacts.readonly
 *   - locations/customFields.readonly
 *
 * Custom fields to create in GHL (Settings -> Custom Fields). Field "Name"
 * sets the display label; the API matches by either the slugified key
 * (e.g. "regen_event") or the full GHL field key ("contact.regen_event").
 * Skipped fields just don't get populated - the contact upsert still happens.
 *
 *   Standard (every event):
 *     regen_event             - the event name, e.g. "signup"
 *     regen_source            - "website" by default
 *     regen_event_at          - ISO timestamp of the latest event
 *
 *   Event-specific (passed through from callsites):
 *     regen_user_id           - signup
 *     regen_confirmed_at      - signup
 *     regen_specialty         - beta_apply
 *     regen_role              - beta_apply
 *     regen_website           - beta_apply
 *     regen_monthly_volume    - beta_apply
 *     regen_why_apply         - beta_apply
 *     regen_website_url       - free_audit
 *     regen_compliance_score  - free_audit
 *     regen_flag_count        - free_audit
 *     regen_high_risk_count   - free_audit
 *     regen_medium_risk_count - free_audit
 *     regen_low_risk_count    - free_audit
 *     regen_tier              - subscription_active ("beta" or "standard")
 *     regen_monthly_price_cents     - subscription_active
 *     regen_stripe_customer_id      - subscription_active / cancelled / payment_failed / invoice_paid
 *     regen_stripe_subscription_id  - subscription_active
 *     regen_amount_due_cents  - payment_failed
 *     regen_subscription_status     - reflects local profiles.subscription_status
 *                                     (active | past_due | cancelled | inactive).
 *                                     Updated on every Stripe -> GHL event so
 *                                     workflows can branch on current status
 *                                     without calling back into our API.
 *     regen_subscription_started_at - ISO timestamp; first time the subscription
 *                                     went active (set on subscription_active).
 *                                     Useful for "thanks for X months as a
 *                                     subscriber" anniversary workflows.
 *     regen_cancelled_at            - ISO timestamp; subscription_cancelled.
 *
 *   Receipt / invoice (drives the receipt workflow - GHL sends the email
 *   using GHL's own email step, not Resend):
 *     regen_invoice_id              - invoice_paid
 *     regen_invoice_number          - invoice_paid (human-readable, e.g. "INV-0001")
 *     regen_invoice_amount_cents    - invoice_paid
 *     regen_invoice_currency        - invoice_paid (lowercased ISO, e.g. "usd")
 *     regen_invoice_url             - invoice_paid (Stripe-hosted invoice page)
 *     regen_invoice_pdf_url         - invoice_paid (direct PDF link)
 *     regen_invoice_period_start    - invoice_paid (ISO timestamp)
 *     regen_invoice_period_end      - invoice_paid (ISO timestamp)
 *     regen_invoice_paid_at         - invoice_paid (ISO timestamp)
 *
 * Tags fired per event (workflows trigger on "Tag Added"):
 *   signup                 -> regen-signup, regen-lifecycle:signup
 *   beta_apply             -> regen-beta-applicant, regen-lifecycle:beta-applied
 *   waitlist               -> regen-waitlist, regen-lifecycle:waitlist
 *   free_audit             -> regen-free-audit, regen-lifecycle:audit-completed
 *   subscription_active    -> regen-subscriber, regen-lifecycle:subscribed,
 *                             regen-tier:beta | regen-tier:standard
 *   subscription_cancelled -> regen-cancelled, regen-lifecycle:cancelled
 *   payment_failed         -> regen-payment-failed
 *   invoice_paid           -> regen-invoice-paid
 *   account_deleted        -> regen-deleted, regen-lifecycle:deleted
 */

export type GhlEvent =
  | "signup"
  | "beta_apply"
  | "waitlist"
  | "free_audit"
  | "subscription_active"
  | "subscription_cancelled"
  | "payment_failed"
  | "invoice_paid"
  | "data_exported"
  | "account_deleted"

export interface GhlContact {
  email: string
  name?: string | null
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  company?: string | null
  /** Event-specific fields. Surface as `regen_<key>` custom fields in GHL. */
  [key: string]: unknown
}

const API_BASE = "https://services.leadconnectorhq.com"
const API_VERSION = "2021-07-28"
const TIMEOUT_MS = 5000

const EVENT_TAGS: Record<GhlEvent, string[]> = {
  signup: ["regen-signup", "regen-lifecycle:signup"],
  beta_apply: ["regen-beta-applicant", "regen-lifecycle:beta-applied"],
  waitlist: ["regen-waitlist", "regen-lifecycle:waitlist"],
  free_audit: ["regen-free-audit", "regen-lifecycle:audit-completed"],
  subscription_active: ["regen-subscriber", "regen-lifecycle:subscribed"],
  subscription_cancelled: ["regen-cancelled", "regen-lifecycle:cancelled"],
  payment_failed: ["regen-payment-failed"],
  invoice_paid: ["regen-invoice-paid"],
  data_exported: ["regen-data-exported"],
  account_deleted: ["regen-deleted", "regen-lifecycle:deleted"],
}

// Keys passed to upsertGhlContact directly as standard contact fields rather
// than custom fields. Everything else gets the `regen_` prefix.
const STANDARD_KEYS = new Set(["email", "name", "first_name", "last_name", "phone", "company"])

// In-memory cache of custom-field-name -> field-id, populated lazily from
// GET /locations/{locationId}/customFields. Lambda-instance-lifetime; refreshes
// every 10 minutes so newly-added fields in GHL get picked up.
let customFieldCache: Map<string, string> | null = null
let cacheExpiresAt = 0
const CACHE_TTL_MS = 10 * 60 * 1000

interface GhlCustomFieldRecord {
  id: string
  name?: string
  fieldKey?: string
}

async function resolveCustomFieldIds(token: string, locationId: string): Promise<Map<string, string>> {
  const now = Date.now()
  if (customFieldCache && now < cacheExpiresAt) return customFieldCache

  try {
    const res = await fetch(`${API_BASE}/locations/${locationId}/customFields`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Version: API_VERSION,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) {
      console.warn(`[GHL] customFields list returned ${res.status}; custom fields will be skipped this run`)
      return customFieldCache ?? new Map()
    }
    const json = (await res.json()) as { customFields?: GhlCustomFieldRecord[] }
    const map = new Map<string, string>()
    for (const cf of json.customFields ?? []) {
      // GHL fieldKey is "contact.<slug>" (or "opportunity.<slug>" for opps).
      // Strip the entity prefix so callsites can use bare keys like "regen_event".
      if (cf.fieldKey) {
        const stripped = cf.fieldKey.replace(/^[a-z]+\./i, "")
        map.set(stripped, cf.id)
        map.set(cf.fieldKey, cf.id)
      }
      if (cf.name) map.set(cf.name, cf.id)
    }
    customFieldCache = map
    cacheExpiresAt = now + CACHE_TTL_MS
    return map
  } catch (e) {
    console.warn("[GHL] customFields list error; skipping custom fields:", e)
    return customFieldCache ?? new Map()
  }
}

interface UpsertOptions {
  email: string
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  companyName?: string | null
  tags: string[]
  customFields: Record<string, string | number | boolean>
}

async function upsertGhlContact(token: string, locationId: string, opts: UpsertOptions): Promise<void> {
  const idMap = await resolveCustomFieldIds(token, locationId)
  const customFieldsArray: Array<{ id: string; value: string }> = []

  for (const [key, value] of Object.entries(opts.customFields)) {
    const id = idMap.get(key)
    if (!id) {
      // Field not yet created in GHL - log once per missing key and continue.
      // The upsert still applies tags + standard fields, so the workflow
      // can fire on tag-add even before all custom fields exist.
      console.warn(`[GHL] custom field "${key}" not found in location ${locationId} - create it in GHL Settings -> Custom Fields`)
      continue
    }
    customFieldsArray.push({ id, value: String(value) })
  }

  const body: Record<string, unknown> = {
    locationId,
    email: opts.email.toLowerCase(),
    source: "regencompliance",
    tags: opts.tags,
  }
  if (opts.firstName) body.firstName = opts.firstName
  if (opts.lastName) body.lastName = opts.lastName
  if (opts.phone) body.phone = opts.phone
  if (opts.companyName) body.companyName = opts.companyName
  if (customFieldsArray.length > 0) body.customFields = customFieldsArray

  try {
    const res = await fetch(`${API_BASE}/contacts/upsert`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Version: API_VERSION,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      console.error(`[GHL] upsert failed ${res.status}: ${text.slice(0, 500)}`)
    }
  } catch (e) {
    console.error("[GHL] upsert error:", e)
  }
}

/**
 * Fire an event into GHL. Upserts the contact by email, applies tags so
 * GHL workflows trigger on tag-add, and writes event-specific data to
 * custom fields so workflows can branch on values. Fire-and-forget;
 * never throws. Caller pattern: `void sendToGhl("signup", { email })`.
 *
 * No-ops with a single warning when GHL_API_TOKEN or GHL_LOCATION_ID
 * are unset, so paid-beta launch can ship before the GHL workflows are
 * built out.
 */
export async function sendToGhl(event: GhlEvent, contact: GhlContact): Promise<void> {
  const token = process.env.GHL_API_TOKEN?.trim()
  const locationId = process.env.GHL_LOCATION_ID?.trim()

  if (!token || !locationId) {
    console.warn(`[GHL] GHL_API_TOKEN / GHL_LOCATION_ID not set, skipping ${event}`)
    return
  }

  // Best-effort split of `name` into first/last when caller didn't separate.
  let firstName = contact.first_name ?? null
  let lastName = contact.last_name ?? null
  if (!firstName && contact.name) {
    const parts = String(contact.name).trim().split(/\s+/)
    firstName = parts[0] ?? null
    lastName = parts.length > 1 ? parts.slice(1).join(" ") : null
  }

  // Standard custom fields populated on every event.
  const customFields: Record<string, string | number | boolean> = {
    regen_event: event,
    regen_source: "website",
    regen_event_at: new Date().toISOString(),
  }

  // Pass through every event-specific field as a `regen_<key>` custom field.
  // Objects/arrays get JSON-stringified - GHL custom fields are scalar.
  for (const [key, value] of Object.entries(contact)) {
    if (STANDARD_KEYS.has(key)) continue
    if (value === undefined || value === null) continue
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      customFields[`regen_${key}`] = value
    } else {
      try {
        customFields[`regen_${key}`] = JSON.stringify(value)
      } catch {
        // ignore unserializable values
      }
    }
  }

  // Subscription-tier tag is event-data-driven, not a static event tag, so it
  // gets appended at fire time rather than baked into EVENT_TAGS.
  const tags = [...EVENT_TAGS[event]]
  if (event === "subscription_active") {
    const tier = contact.tier
    if (tier === "beta" || tier === "standard") tags.push(`regen-tier:${tier}`)
  }

  await upsertGhlContact(token, locationId, {
    email: contact.email,
    firstName,
    lastName,
    phone: typeof contact.phone === "string" ? contact.phone : null,
    companyName: typeof contact.company === "string" ? contact.company : null,
    tags,
    customFields,
  })
}
