// Admin justification gate.
//
// Every admin action that decrypts user data or starts an impersonation must
// include a non-empty justification string explaining WHY the admin is
// accessing this user. The justification is stored into audit_log.details so
// the operator (and any future SOC 2 auditor) can review intent, not just the
// fact that an access occurred.
//
// Rules:
//   - 10 character minimum: forces real context. Single chars and "test"
//     are rejected.
//   - 500 character maximum: prevents a paste of an arbitrary blob into the
//     audit log (which is encrypted with a per-system key but still subject
//     to row-size limits + readability when an auditor exports CSV).
//   - String type required: a missing field, an empty string, a non-string
//     value all fail with the same shape so the frontend has exactly one
//     error path to render.
//
// The structured `error` payload is shaped so that any route can simply do:
//
//   const check = extractJustification(body)
//   if (!check.ok) return NextResponse.json(check.error.body, { status: check.error.status })
//
// without re-deriving the status code or copy in each route.

export interface JustificationCheck {
  ok: boolean
  justification?: string // trimmed, length-checked
  error?: { status: number; body: { error: string } }
}

const MIN_LENGTH = 10
const MAX_LENGTH = 500

const ERROR_MESSAGE =
  "Admin action requires a justification (10-500 chars) explaining why you're accessing this user's data."

/**
 * Pull `justification` from a JSON body, trim it, and enforce the 10-500 char
 * window. Returns a structured result so callers can branch on `ok` without
 * re-implementing error shape.
 */
export function extractJustification(body: unknown): JustificationCheck {
  // body must be an object with a `justification` field.
  if (!body || typeof body !== "object") {
    return {
      ok: false,
      error: { status: 400, body: { error: ERROR_MESSAGE } },
    }
  }

  const raw = (body as Record<string, unknown>).justification
  if (typeof raw !== "string") {
    return {
      ok: false,
      error: { status: 400, body: { error: ERROR_MESSAGE } },
    }
  }

  const trimmed = raw.trim()
  if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) {
    return {
      ok: false,
      error: { status: 400, body: { error: ERROR_MESSAGE } },
    }
  }

  return { ok: true, justification: trimmed }
}
