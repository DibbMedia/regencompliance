import crypto from "crypto"

/**
 * Hash content for scan result caching.
 * Same content (case-insensitive, trimmed) produces the same hash,
 * allowing us to skip redundant Claude API calls.
 */
export function hashContent(text: string): string {
  return crypto.createHash("sha256").update(text.trim().toLowerCase()).digest("hex")
}
