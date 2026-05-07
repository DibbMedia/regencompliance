/**
 * Canonical site URL. Reads from `NEXT_PUBLIC_APP_URL` (validated in `lib/env.ts`).
 *
 * The fallback is the pre-cutover value so dev/preview builds without the env
 * var still produce sensible output. In production the env var is required by
 * env validation, so the fallback never fires.
 *
 * Trailing slashes are stripped so `${SITE_URL}/path` always produces a clean URL.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://regencompliance.ai"
).replace(/\/+$/, "")

/** Absolute URL for a path like `/blog/foo` -> `https://regencompliance.ai/blog/foo` */
export function absoluteUrl(path: string): string {
  if (!path.startsWith("/")) return `${SITE_URL}/${path}`
  return `${SITE_URL}${path}`
}
