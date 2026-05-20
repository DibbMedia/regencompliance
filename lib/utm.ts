/**
 * UTM tracking foundation.
 *
 * Captures utm_source/medium/campaign/term/content + referrer + landing_path
 * on first visit and persists them in an HttpOnly cookie so server routes
 * (waitlist, free-audit, beta-apply, signup, etc.) can read the attribution
 * data without trusting client input.
 *
 * Wire surface:
 *   - `components/utm-tracker.tsx` reads `window.location` on first paint
 *     and POSTs to `/api/utm/track` when any utm_* param is present.
 *   - `app/api/utm/track/route.ts` validates, builds a canonical payload via
 *     `parseUtmFromUrl`, and writes the `rc_utm` cookie via
 *     `serializeUtmCookie`.
 *   - Server routes that want attribution call `parseUtmCookie(cookieStore.get("rc_utm")?.value)`.
 *
 * Contract notes:
 *   - Cookie name is the single source of truth via `UTM_COOKIE_NAME`.
 *   - `parseUtmCookie` MUST NEVER throw - malformed cookies degrade to `{}`.
 *   - All inbound string values pass through `sanitizeUtmValue` so a single
 *     500-char cap + CR/LF strip applies uniformly (request smuggling guard
 *     + storage bound).
 */

export const UTM_COOKIE_NAME = "rc_utm"

export interface UtmPayload {
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_term?: string | null
  utm_content?: string | null
  referrer?: string | null
  landing_path?: string | null
  captured_at?: string | null // ISO timestamp
}

const UTM_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const

type UtmParamKey = (typeof UTM_PARAM_KEYS)[number]

/**
 * Normalize a raw UTM value: trim, collapse CR/LF/TAB to spaces, cap at
 * 500 chars, return null when empty. Centralizing the rule means every
 * inbound surface (URL params, JSON body, cookie roundtrip) gets the same
 * bound.
 */
export function sanitizeUtmValue(v: string | null | undefined): string | null {
  if (v === null || v === undefined) return null
  if (typeof v !== "string") return null
  const cleaned = v.replace(/[\r\n\t]/g, " ").trim()
  if (cleaned.length === 0) return null
  return cleaned.slice(0, 500)
}

/**
 * Build a canonical UtmPayload from a URL + optional referrer.
 *
 * Always returns a populated `landing_path` + `captured_at`, even when no
 * utm_* params are present. Callers (route handler) decide whether to
 * persist a cookie based on whether any utm_* field is non-null.
 */
export function parseUtmFromUrl(
  url: URL,
  referrer?: string | null,
): UtmPayload {
  const payload: UtmPayload = {}
  for (const key of UTM_PARAM_KEYS) {
    payload[key] = sanitizeUtmValue(url.searchParams.get(key))
  }
  payload.referrer = sanitizeUtmValue(referrer ?? null)
  payload.landing_path = sanitizeUtmValue(url.pathname) ?? "/"
  payload.captured_at = new Date().toISOString()
  return payload
}

/**
 * Encode a payload for cookie storage. We use base64url(JSON) instead of
 * raw JSON so the cookie value never contains characters that need
 * percent-encoding or might trip set-cookie parsers in edge proxies.
 */
export function serializeUtmCookie(payload: UtmPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url")
}

/**
 * Decode a cookie value back into a UtmPayload. NEVER throws; returns
 * `{}` on any failure (missing cookie, malformed base64, non-JSON
 * contents, JSON that isn't an object). This is the security boundary -
 * the cookie is HttpOnly but a stale or attacker-crafted value must
 * degrade gracefully.
 */
export function parseUtmCookie(
  raw: string | undefined | null,
): UtmPayload {
  if (!raw || typeof raw !== "string") return {}
  try {
    const decoded = Buffer.from(raw, "base64url").toString("utf8")
    if (!decoded) return {}
    const parsed = JSON.parse(decoded) as unknown
    if (
      parsed === null ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return {}
    }
    // Sanitize every field on the way back out so a tampered cookie
    // can't carry oversized or CR/LF-poisoned values into routes.
    const source = parsed as Record<string, unknown>
    const out: UtmPayload = {}
    for (const key of UTM_PARAM_KEYS) {
      const v = source[key]
      out[key] =
        typeof v === "string" || v === null ? sanitizeUtmValue(v as string | null) : null
    }
    const referrer = source.referrer
    out.referrer =
      typeof referrer === "string" || referrer === null
        ? sanitizeUtmValue(referrer as string | null)
        : null
    const landing = source.landing_path
    out.landing_path =
      typeof landing === "string" || landing === null
        ? sanitizeUtmValue(landing as string | null)
        : null
    const captured = source.captured_at
    out.captured_at =
      typeof captured === "string" ? sanitizeUtmValue(captured) : null
    return out
  } catch {
    return {}
  }
}

/**
 * Returns true when at least one utm_* field on the payload is non-null.
 * Routes use this to decide whether the cookie should be (re)written -
 * never overwrite an existing cookie just because someone hit the
 * homepage with no params.
 */
export function hasAnyUtm(payload: UtmPayload): boolean {
  for (const key of UTM_PARAM_KEYS) {
    if (payload[key]) return true
  }
  return false
}

/**
 * Read the UTM payload off a Request's Cookie header. Prefer this in route
 * handlers over Next's `cookies()` API: the Request-header path works in
 * both production AND vitest (which calls route handlers directly with a
 * mocked Request and has no Next request scope, so `cookies()` throws).
 * Fail-open like `parseUtmCookie` - always returns a (possibly empty)
 * UtmPayload, never throws.
 */
export function parseUtmCookieFromRequest(request: Request): UtmPayload {
  const header = request.headers.get("cookie")
  if (!header) return {}
  // Cheap cookie-header parse: split on ";", trim, find the rc_utm pair.
  // Avoids pulling a cookie-parser dependency for one lookup.
  const prefix = `${UTM_COOKIE_NAME}=`
  for (const pair of header.split(";")) {
    const trimmed = pair.trim()
    if (trimmed.startsWith(prefix)) {
      return parseUtmCookie(trimmed.slice(prefix.length))
    }
  }
  return {}
}

// Re-export the param key tuple for callers that want to iterate.
export { UTM_PARAM_KEYS }
export type { UtmParamKey }
