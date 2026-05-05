import { timingSafeEqual } from "node:crypto"

/**
 * Constant-time comparison of the incoming Authorization header against the
 * configured CRON_SECRET. Returns true if the header matches `Bearer <secret>`.
 *
 * Replaces the per-route `header !== ...` checks - those used `!==` which
 * short-circuits on first mismatched byte, leaking the secret length / prefix
 * over the network through timing differences. The blast radius is small
 * (cron routes drain Anthropic budget + edit compliance rules globally) but
 * the cost of fixing is trivial.
 */
export function isCronAuthorized(authHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret || !authHeader) return false

  const expected = `Bearer ${secret}`
  const a = Buffer.from(authHeader)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
