// Admin step-up authentication.
//
// Destructive admin actions (impersonate-start, user-delete) require that the
// admin has re-authenticated within the last 5 minutes, even if their normal
// session is fresh. This is a defense against:
//   - stolen/unattended session cookies being used for destructive ops,
//   - the admin's session being silently extended while the laptop is open,
//   - an XSS or CSRF that rides on the normal session being able to delete
//     accounts.
//
// Mechanism: the operator hits POST /api/admin/step-up with their current
// password; if Supabase Auth accepts it, we issue a short-lived HMAC cookie
// (`rc_admin_stepup`) scoped to /api/admin. The destructive routes check
// `hasFreshStepUp(request)` first. Missing/expired/forged cookie -> 401 with
// `{ error: "step_up_required" }`, which the frontend uses as the signal to
// pop the re-auth modal.
//
// Cookie format:
//   value = base64url(`${userIdHex}.${timestampMs}.${hmacHex}`)
//   hmac  = HMAC-SHA256(STEP_UP_SECRET, `${userIdHex}.${timestampMs}`)
//
// Attributes (locked contract):
//   HttpOnly, SameSite=Strict, Path=/api/admin, Max-Age=300, Secure in prod.
//
// Path=/api/admin keeps the cookie out of public routes (it shouldn't show up
// on /api/scan, /api/billing, etc). Note: this means the cookie does NOT gate
// `/admin/*` server-component pages. Those are protected by `verifyAdmin()` +
// the platform_admins table. The step-up cookie ONLY gates the destructive
// API actions. Read-only admin pages remain accessible with a normal session.
//
// Key sourcing: prefers `ADMIN_STEP_UP_SECRET`. Falls back to
// `ENCRYPTION_KEY_V1.slice(0, 32)` so dev works without an extra env var.
// The fallback is a 32-char hex slice of the master crypto key, not the full
// key, to avoid bleeding the master key into a cookie HMAC. Cross-env cookie
// reuse is broken (different master keys -> different secrets) which is
// desirable.

import { createHmac, timingSafeEqual } from "node:crypto"

export const STEP_UP_COOKIE = "rc_admin_stepup"
export const STEP_UP_TTL_SECONDS = 300 // 5 min
export const STEP_UP_COOKIE_PATH = "/api/admin"

const SECRET_ENV = "ADMIN_STEP_UP_SECRET"
const FALLBACK_ENV = "ENCRYPTION_KEY_V1"

function loadSecret(): string {
  const explicit = process.env[SECRET_ENV]?.trim()
  if (explicit) return explicit
  const fallback = process.env[FALLBACK_ENV]?.trim()
  if (fallback && fallback.length >= 32) {
    // 32 hex chars = 16 bytes of entropy, plenty for an HMAC key. Slice
    // (not full key) avoids leaking the master key shape into the cookie.
    return fallback.slice(0, 32)
  }
  throw new Error(
    `Missing ${SECRET_ENV}. Set it via \`openssl rand -hex 32\`, or set ${FALLBACK_ENV} (lib/crypto.ts master key) so the fallback can be derived.`,
  )
}

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

function fromB64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4))
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64")
}

function computeHmac(payload: string): string {
  const secret = loadSecret()
  return b64url(createHmac("sha256", secret).update(payload, "utf8").digest())
}

/**
 * Server-side helper to issue a fresh cookie value. The caller is responsible
 * for setting the cookie attributes on the NextResponse (see
 * app/api/admin/step-up/route.ts for the canonical setup).
 */
export function signStepUpCookie(userId: string): { value: string; maxAge: number } {
  if (!userId || typeof userId !== "string") {
    throw new Error("signStepUpCookie: userId required")
  }
  const ts = Date.now()
  const payload = `${userId}.${ts}`
  const sig = computeHmac(payload)
  // base64url(`${userId}.${ts}.${sig}`) — the whole envelope is one opaque
  // token from the client's perspective. We always store as base64url so
  // browsers don't try to "helpfully" url-decode the embedded dots.
  const value = b64url(Buffer.from(`${payload}.${sig}`, "utf8"))
  return { value, maxAge: STEP_UP_TTL_SECONDS }
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie")
  if (!header) return null
  // Split on `;`, then key=value. Pull the LAST matching value (browsers
  // sometimes send dupes when path overlap is weird; last-wins matches
  // what next/headers does).
  let found: string | null = null
  for (const part of header.split(";")) {
    const eq = part.indexOf("=")
    if (eq < 0) continue
    const k = part.slice(0, eq).trim()
    if (k === name) {
      found = part.slice(eq + 1).trim()
    }
  }
  return found
}

/**
 * Returns true if the `rc_admin_stepup` cookie:
 *   - is present,
 *   - decodes to a valid `${userId}.${ts}.${sig}` triple,
 *   - has a signature that matches HMAC-SHA256(secret, `${userId}.${ts}`)
 *     compared via timingSafeEqual,
 *   - has a timestamp within STEP_UP_TTL_SECONDS of now.
 *
 * Returns false on anything else — bad cookie, forged sig, expired, missing
 * secret env, malformed payload. NEVER throws (callers gate on truthiness).
 */
export async function hasFreshStepUp(request: Request): Promise<boolean> {
  try {
    const raw = readCookie(request, STEP_UP_COOKIE)
    if (!raw) return false

    let decoded: string
    try {
      decoded = fromB64url(raw).toString("utf8")
    } catch {
      return false
    }

    const parts = decoded.split(".")
    if (parts.length !== 3) return false
    const [userId, tsStr, sig] = parts
    if (!userId || !tsStr || !sig) return false

    const ts = Number(tsStr)
    if (!Number.isFinite(ts) || ts <= 0) return false

    const expected = computeHmac(`${userId}.${tsStr}`)
    const expectedBuf = Buffer.from(expected, "utf8")
    const sigBuf = Buffer.from(sig, "utf8")
    if (expectedBuf.length !== sigBuf.length) return false
    if (!timingSafeEqual(expectedBuf, sigBuf)) return false

    const ageMs = Date.now() - ts
    if (ageMs < 0) return false
    if (ageMs > STEP_UP_TTL_SECONDS * 1000) return false

    return true
  } catch {
    return false
  }
}

export interface StepUpRequiredResponse {
  status: 401
  body: { error: "step_up_required" }
}

/**
 * Canonical 401 payload for destructive admin routes that fail the step-up
 * check. The frontend treats `error === "step_up_required"` as the signal to
 * pop the re-auth modal (POST /api/admin/step-up with the password) and then
 * retry the original request.
 */
export function stepUpRequired(): StepUpRequiredResponse {
  return { status: 401, body: { error: "step_up_required" } }
}
