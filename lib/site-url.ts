/**
 * Canonical site URLs. The product runs across two domains:
 *
 * - MARKETING_URL is the apex (regencompliance.ai). Used for marketing
 *   canonicals, sitemap, robots, OG images, llms.txt, and any link sent to
 *   public/unauthenticated visitors.
 * - APP_URL is the subdomain (app.regencompliance.ai). Used for Stripe
 *   return/success URLs, Supabase auth callbacks, password reset emails,
 *   and every link inside an authenticated user-facing email.
 *
 * Both fall back to production hosts so dev/preview builds without the env
 * vars still produce sensible output. In production env validation requires
 * NEXT_PUBLIC_APP_URL; NEXT_PUBLIC_MARKETING_URL is optional and defaults
 * to the apex constant below.
 *
 * Trailing slashes are stripped so `${APP_URL}/path` always produces a clean URL.
 *
 * SITE_URL stays exported as a deprecated alias of MARKETING_URL so existing
 * canonical/sitemap callers keep working without a forced rename. New callers
 * should import MARKETING_URL or APP_URL explicitly based on the link target.
 */
export const MARKETING_URL = (
  process.env.NEXT_PUBLIC_MARKETING_URL ?? "https://regencompliance.ai"
).replace(/\/+$/, "")

export const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://app.regencompliance.ai"
).replace(/\/+$/, "")

/** @deprecated Prefer MARKETING_URL for marketing canonicals or APP_URL for app-side links. */
export const SITE_URL = MARKETING_URL

function joinPath(base: string, path: string): string {
  if (!path.startsWith("/")) return `${base}/${path}`
  return `${base}${path}`
}

/** Absolute URL on the marketing apex (e.g. `/blog/foo` -> `https://regencompliance.ai/blog/foo`). */
export function marketingUrl(path: string): string {
  return joinPath(MARKETING_URL, path)
}

/** Absolute URL on the app subdomain (e.g. `/dashboard` -> `https://app.regencompliance.ai/dashboard`). */
export function appUrl(path: string): string {
  return joinPath(APP_URL, path)
}

/** @deprecated Prefer marketingUrl() or appUrl() depending on the link target. */
export function absoluteUrl(path: string): string {
  return marketingUrl(path)
}
