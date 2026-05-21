/**
 * Marketing-apex robots policy (Next 16 metadata route).
 *
 * Three-layer bot policy across the codebase:
 *   1. THIS FILE (robots.txt)  - the courtesy + legal-intent signal. Bots
 *      that respect robots.txt comply voluntarily. This is a published
 *      statement of which crawlers we welcome and which we don't.
 *   2. middleware (proxy.ts)   - ENFORCEMENT. Classifies UA + path and
 *      blocks/challenges denied bots regardless of what they say or whether
 *      they ever read robots.txt. Malicious scrapers that ignore robots.txt
 *      get caught here.
 *   3. lib/security/bot-defense.ts - canonical BOT-A allowlist + BOT-D
 *      denylist constants. The arrays in THIS file mirror those constants
 *      exactly so the courtesy signal stays in lockstep with enforcement.
 *
 * If you change the allow/deny lists below, update the matching constants
 * in lib/security/bot-defense.ts (and the middleware that consumes them)
 * in the same commit so all three layers stay aligned.
 *
 * The app subdomain (app.regencompliance.ai) serves a Disallow-all robots
 * from middleware, so this file only ever runs on the apex marketing host.
 */
import type { MetadataRoute } from "next"
import { MARKETING_URL } from "@/lib/site-url"

// Allow + index marketing surfaces, but never index API responses or
// authenticated/admin shells.
const ALLOWED_BOT_DISALLOW_PATHS = [
  "/api/",
  "/admin/",
  "/superadmin/",
  "/auth/",
]

// User-agents that are explicitly welcome to crawl the public marketing
// surface. Mirrors BOT-A in lib/security/bot-defense.ts.
const ALLOWED_BOTS = [
  // OpenAI
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Anthropic
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  // Major search engines
  "Googlebot",
  "Bingbot",
  "DuckDuckBot",
  "Applebot",
  "Amazonbot",
  // Social / link unfurl
  "facebookexternalhit",
  "Twitterbot",
  "LinkedInBot",
  "Slackbot",
  "Discordbot",
]

// User-agents we explicitly do NOT want crawling. Polite ones honor this;
// rude ones get blocked by middleware (proxy.ts) at the UA + path layer.
// Mirrors BOT-D in lib/security/bot-defense.ts.
const DISALLOWED_BOTS = [
  // ByteDance scraper (capitalization variants both observed in the wild).
  "bytespider",
  "Bytespider",
  // SEO / backlink scrapers
  "Diffbot",
  "MJ12bot",
  "AhrefsBot",
  "SemrushBot",
  "dotbot",
  "DotBot",
  "DataForSeoBot",
  "PetalBot",
  "SeznamBot",
  "BLEXBot",
  "ZoomBot",
  "CCBot",
  // Other low-value / abusive crawlers
  "Sogou",
  "magpie-crawler",
  "meanpathbot",
  "mediatoolkitbot",
  "WeViKaBot",
  "spaziodati",
]

// Anything not in the allow- or deny-list gets the default policy:
// crawl the marketing surface, but stay out of the app shell + API.
const CATCHALL_DISALLOW_PATHS = [
  "/api/",
  "/admin/",
  "/superadmin/",
  "/auth/",
  "/dashboard/",
  "/_next/",
  "/static/",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Allowlisted AI + search + social bots: index the marketing surface,
      // stay out of API responses and admin shells.
      {
        userAgent: ALLOWED_BOTS,
        allow: "/",
        disallow: ALLOWED_BOT_DISALLOW_PATHS,
      },
      // Denylisted scrapers: please go away (the polite ones will).
      {
        userAgent: DISALLOWED_BOTS,
        disallow: "/",
      },
      // Catch-all for unrecognized but polite bots. MUST be last - some
      // robots.txt parsers apply the first matching User-agent block and
      // ignore later ones, so a `*` rule above would shadow the explicit
      // allow/deny lists.
      {
        userAgent: "*",
        allow: "/",
        disallow: CATCHALL_DISALLOW_PATHS,
      },
    ],
    sitemap: `${MARKETING_URL}/sitemap.xml`,
    host: MARKETING_URL,
  }
}
