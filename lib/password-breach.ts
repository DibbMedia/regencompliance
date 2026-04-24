// HaveIBeenPwned password-breach check via k-anonymity API.
//
// Flow:
//   1. SHA-1 the user's plaintext password (hash is NEVER sent).
//   2. Send the first 5 hex chars ("prefix") to api.pwnedpasswords.com.
//   3. HIBP returns a list of suffix:count lines for every breached
//      password whose hash starts with that prefix.
//   4. If OUR suffix is in the list, the password has been seen in a
//      known breach — reject with a user-facing message.
//
// The first-5-chars-only upload design means HIBP never learns the
// full hash, let alone the plaintext. See:
// https://haveibeenpwned.com/API/v3#PwnedPasswords
//
// Fail-open on network error: a transient HIBP outage should not block
// legitimate signups. The password-complexity rules in zod already
// provide a floor; this is defense-in-depth against password reuse
// from other sites' breaches.
import { createHash } from "node:crypto"

const HIBP_ENDPOINT = "https://api.pwnedpasswords.com/range/"
const TIMEOUT_MS = 3_000

export interface BreachCheckResult {
  breached: boolean
  count?: number
}

export async function checkPasswordBreach(password: string): Promise<BreachCheckResult> {
  try {
    const fullHash = createHash("sha1").update(password, "utf8").digest("hex").toUpperCase()
    const prefix = fullHash.slice(0, 5)
    const suffix = fullHash.slice(5)

    const res = await fetch(HIBP_ENDPOINT + prefix, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        // HIBP requires Add-Padding: true for strong k-anonymity.
        // Without it, response size could leak whether the password is breached.
        "Add-Padding": "true",
        "User-Agent": "regencompliance-signup-check",
      },
    })
    if (!res.ok) return { breached: false }

    const body = await res.text()
    const lines = body.split(/\r?\n/)
    for (const line of lines) {
      const [lineSuffix, countStr] = line.split(":")
      if (!lineSuffix) continue
      if (lineSuffix.toUpperCase() === suffix) {
        const count = Number((countStr ?? "0").trim())
        // Padding entries from Add-Padding header have count=0; real hits are positive.
        if (count > 0) return { breached: true, count }
      }
    }
    return { breached: false }
  } catch {
    // Fail-open on network / timeout. See file header for rationale.
    return { breached: false }
  }
}
