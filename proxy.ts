import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { enforceOrigin } from "@/lib/security/origin"
import { parseAllowedIps } from "@/lib/security/ip-allowlist"
import { classifyRequest } from "@/lib/security/bot-defense"

const IMPERSONATE_COOKIE = "regen_impersonate"

// Bot-defense sampled-warn counters. Mirrors the F-09/admin-IP-allowlist
// pattern: log the 1st hit + every 100th to keep prod logs readable while
// still surfacing burst behavior. Lives in module scope; resets on cold
// start (fine - logs are best-effort observability, not audit-grade).
let botDefenseDenyCount = 0
// `botDefenseAllowCount` + `botDefenseRateLimitCount` are reserved for
// symmetry with the deny counter so future tightening (e.g. promoting
// rate-limit-strict to an actual response-side throttle) can sample on the
// same cadence. Currently allow-logs are de-duped via the
// `seenAllowedCrawlers` Set below, and rate-limit-strict only logs the
// first hit per cold start - the counters drive the sample cadence.
let botDefenseAllowCount = 0
let botDefenseRateLimitCount = 0
const BOT_DEFENSE_LOG_SAMPLE = 100

// First-hit-per-signature dedup for the noisy "ALLOW" log line. A single
// Googlebot crawl can hit hundreds of paths; we only need to know the
// crawler showed up once per cold start.
const seenAllowedCrawlers = new Set<string>()

// Env-gated IP allowlist for admin surfaces. Parsed once at module load so
// every request reads from the cached matcher instead of re-parsing the env
// string. When ADMIN_ALLOWED_IPS is unset / empty, the matcher reports
// isEmpty()=true and the gate below short-circuits (graceful "feature off"
// default - safe for dev + opt-in production deployment).
const adminIpAllowlist = parseAllowedIps(process.env.ADMIN_ALLOWED_IPS)

// Sampled-warn counter for denial logs (every 1st + every 100th, matching
// the F-02 / F-09 pattern used elsewhere). Lives in module scope; resets
// only on cold start, which is fine - logs are best-effort.
let adminIpDenialCount = 0

/**
 * Extract the client IP from a NextRequest. Mirrors `lib/ip.ts`'s priority
 * order: x-vercel-forwarded-for -> x-forwarded-for (LEFT-most per RFC 7239,
 * which is the original client - the lib/ip version uses the rightmost for
 * its own reasons; for an allowlist gate we want the originating client)
 * -> x-real-ip. Inlined instead of imported because the admin-IP gate has
 * different leftmost-vs-rightmost semantics from the general-purpose helper.
 */
function getAdminGateClientIp(request: NextRequest): string {
  const vercel = request.headers
    .get("x-vercel-forwarded-for")
    ?.split(",")[0]
    ?.trim()
  if (vercel) return vercel
  const xff = request.headers.get("x-forwarded-for")
  if (xff) {
    const first = xff.split(",")[0]?.trim()
    if (first) return first
  }
  const real = request.headers.get("x-real-ip")
  if (real) return real.trim()
  return "unknown"
}

function isAdminGatedPath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/superadmin" ||
    pathname.startsWith("/superadmin/") ||
    pathname.startsWith("/api/admin/")
  )
}

// Canonical production hosts. Localhost / preview deploys / vercel.app hosts
// fall through and serve everything from one host (single-domain dev mode).
//
// MARKETING_HOSTS includes both apex and www so the middleware doesn't fight
// whichever variant Vercel resolves as primary. We do NOT redirect between
// them - Vercel's domain config decides canonical. (An earlier www -> apex
// redirect here caused a loop with Vercel's apex -> www redirect when www
// was set primary.)
const APP_HOST = "app.regencompliance.ai"
const MARKETING_HOSTS = ["regencompliance.ai", "www.regencompliance.ai"]
// Used for cross-domain redirect targets (app subdomain -> marketing). We
// pick the bare apex; Vercel will further redirect to www if that's primary.
const MARKETING_REDIRECT_HOST = "regencompliance.ai"

// publicPaths bypass the auth check below. These are mostly relevant on the
// app host (the marketing-host short-circuit further down already exempts
// every non-API page). The marketing entries here only fire on single-host
// preview/dev environments.
const publicPaths = [
  "/",
  "/login",
  "/signup",
  "/auth/callback",
  "/demo",
  "/features",
  "/pricing",
  "/faq",
  "/waitlist",
  "/privacy",
  "/terms",
  "/forgot-password",
  "/auth/reset-password",
]

// Both canonical hosts are valid connect-src targets. Cross-origin hops
// between the marketing apex and the app subdomain (Next.js <Link> prefetch
// of app paths from marketing pages, login redirects) are otherwise blocked
// by connect-src 'self'. Derived at runtime from the same env vars and with
// the same trim / www-variant / try-catch handling as allowedOrigins() in
// lib/security/origin.ts.
function siteConnectOrigins(): string[] {
  const out: string[] = []
  for (const envVar of ["NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_MARKETING_URL"]) {
    const value = process.env[envVar]?.trim()
    if (value) {
      try {
        const parsed = new URL(value)
        out.push(parsed.origin)
        if (
          envVar === "NEXT_PUBLIC_MARKETING_URL" &&
          !parsed.hostname.startsWith("www.")
        ) {
          out.push(`${parsed.protocol}//www.${parsed.hostname}`)
        }
      } catch {
        /* ignore malformed env */
      }
    }
  }
  return out
}

function buildCsp(nonce: string): string {
  const siteOrigins = siteConnectOrigins()
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https: data:",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self'${siteOrigins.length ? " " + siteOrigins.join(" ") : ""} https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.anthropic.com https://*.sentry.io https://*.vercel-insights.com https://vitals.vercel-insights.com`,
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
    // Legacy report-uri is still what most browsers honor; report-to is the
    // modern replacement, wired via the Reporting-Endpoints header below.
    "report-uri /api/csp-report",
    "report-to csp-endpoint",
  ].join("; ")
}

function generateNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  let bin = ""
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

function isAppPath(pathname: string): boolean {
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password"
  ) {
    return true
  }
  if (pathname.startsWith("/auth/")) return true
  if (pathname === "/onboarding" || pathname.startsWith("/onboarding/")) return true
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return true
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true
  return false
}

// Paths served identically on either host (no cross-domain redirect): API
// routes, sitemap, robots, llms.txt. Static files are excluded by the matcher
// below before middleware even runs.
function isSharedPath(pathname: string): boolean {
  if (pathname.startsWith("/api/")) return true
  if (
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/llms.txt"
  ) {
    return true
  }
  return false
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ===== STAGE 0: Bot defense =====
  // Runs FIRST - before host routing, CSP build, impersonate cookie check,
  // admin-IP allowlist, or Supabase auth roundtrip. A vuln scanner hitting
  // /wp-admin gets cut here without burning any downstream cost. The
  // classifier returns one of: "allow" (named AI crawler we trust),
  // "deny" (UA/path/pattern match for vuln scanners + probes),
  // "rate-limit-strict" (suspicious but not deny-worthy - flagged for
  // ops + future tightening), or "normal" (everyone else, fall through).
  const classification = classifyRequest(request)
  let botDefenseHeader: string | null = null

  if (classification.verdict === "deny") {
    botDefenseDenyCount += 1
    if (
      botDefenseDenyCount === 1 ||
      botDefenseDenyCount % BOT_DEFENSE_LOG_SAMPLE === 0
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        `[bot-defense] DENY reason=${classification.reason} signature=${classification.matchedSignature} path=${pathname} ua=${(request.headers.get("user-agent") || "").slice(0, 200)} total=${botDefenseDenyCount}`,
      )
    }
    // Tarpit attacker-probe-path requests for 2s so scanners give up on
    // slow targets. Skip for vuln-scanner-ua + bad-scraper-ua reasons -
    // they retry regardless, so eating CPU/connection seconds on them is
    // a cost we pay for no behavioral payoff. Edge runtime supports
    // setTimeout via the standard global; await-on-Promise is fine.
    if (classification.reason === "attacker-probe-path") {
      await new Promise((r) => setTimeout(r, 2000))
    }
    // Generic body - don't leak which signature tripped (deny-by-obscurity
    // for the matched pattern; the log line has the detail for ops).
    return new NextResponse("Forbidden", { status: 403 })
  }

  if (classification.verdict === "rate-limit-strict") {
    botDefenseRateLimitCount += 1
    if (
      botDefenseRateLimitCount === 1 ||
      botDefenseRateLimitCount % BOT_DEFENSE_LOG_SAMPLE === 0
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        `[bot-defense] RATE-LIMIT-STRICT reason=${classification.reason} signature=${classification.matchedSignature} path=${pathname} ua=${(request.headers.get("user-agent") || "").slice(0, 200)} total=${botDefenseRateLimitCount}`,
      )
    }
    // Don't deny - let existing per-route rate limits handle the throttle.
    // We just flag for observability + future tightening (downstream
    // rate limiters can read this header and apply lower thresholds).
    botDefenseHeader = "strict-rate-limit"
  }

  if (classification.verdict === "allow") {
    botDefenseAllowCount += 1
    if (!seenAllowedCrawlers.has(classification.matchedSignature)) {
      seenAllowedCrawlers.add(classification.matchedSignature)
      // eslint-disable-next-line no-console
      console.info(
        `[bot-defense] ALLOW first-hit ai-crawler=${classification.matchedSignature} path=${pathname}`,
      )
    }
    // We do NOT skip the admin-IP allowlist or any other downstream gate
    // for "allowed" crawlers. The verdict is a trust hint, not a bypass -
    // a malicious actor spoofing the Googlebot UA shouldn't get a free
    // pass through /admin. Flag for observability and proceed.
    botDefenseHeader = "ai-crawler-allowed"
  }

  // "normal" falls through with no extra work.

  const host = (request.headers.get("host") ?? "").toLowerCase().split(":")[0]
  const isAppHost = host === APP_HOST
  const isMarketingHost = MARKETING_HOSTS.includes(host)
  const isCanonicalHost = isAppHost || isMarketingHost

  // Cross-domain routing on canonical hosts. App paths hit on the apex 308 to
  // the app subdomain; marketing paths hit on the app subdomain 308 to the
  // bare apex (Vercel handles further apex<->www canonicalization). Shared
  // paths (api, sitemap, robots, llms.txt) are served on whichever host
  // received the request.
  if (isCanonicalHost && !isSharedPath(pathname)) {
    const pathIsApp = isAppPath(pathname)
    if (isMarketingHost && pathIsApp) {
      const url = new URL(request.url)
      url.host = APP_HOST
      return NextResponse.redirect(url, 308)
    }
    if (isAppHost && !pathIsApp) {
      const url = new URL(request.url)
      url.host = MARKETING_REDIRECT_HOST
      return NextResponse.redirect(url, 308)
    }
  }

  // App subdomain SEO hardening. Even though X-Robots-Tag below tells crawlers
  // not to index, serve a Disallow-all robots.txt and an empty sitemap so
  // crawlers that ignore X-Robots-Tag (yandex etc.) also don't index.
  if (isAppHost && pathname === "/robots.txt") {
    return new NextResponse("User-agent: *\nDisallow: /\n", {
      status: 200,
      headers: {
        "content-type": "text/plain",
        "x-robots-tag": "noindex, nofollow",
      },
    })
  }
  if (isAppHost && pathname === "/sitemap.xml") {
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      {
        status: 200,
        headers: {
          "content-type": "application/xml",
          "x-robots-tag": "noindex, nofollow",
        },
      },
    )
  }

  const nonce = generateNonce()
  const csp = buildCsp(nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("Content-Security-Policy", csp)

  const applyCsp = (response: NextResponse): NextResponse => {
    response.headers.set("Content-Security-Policy", csp)
    response.headers.set("x-nonce", nonce)
    response.headers.set(
      "Reporting-Endpoints",
      'csp-endpoint="/api/csp-report"',
    )
    response.headers.set(
      "Content-Security-Policy-Report-Only",
      [
        "require-trusted-types-for 'script'",
        "trusted-types 'allow-duplicates' default react nextjs#bundler",
        "report-uri /api/csp-report",
        "report-to csp-endpoint",
      ].join("; "),
    )
    if (isAppHost) {
      response.headers.set("X-Robots-Tag", "noindex, nofollow")
    }
    // Bot-defense verdict header for observability (rate-limit-strict +
    // ai-crawler-allowed). Future enhancement: downstream rate limiters
    // can read this header and tighten thresholds when it's set.
    if (botDefenseHeader) {
      response.headers.set("x-bot-defense", botDefenseHeader)
    }
    return response
  }

  // Env-gated IP allowlist for admin surfaces. Runs BEFORE the marketing
  // short-circuit and BEFORE the Supabase auth roundtrip - a disallowed IP
  // should fail fast without spending a DB call or even seeing the rest of
  // the routing logic. When ADMIN_ALLOWED_IPS is unset, `isEmpty()` is true
  // and the gate is a no-op (feature off by default).
  if (!adminIpAllowlist.isEmpty() && isAdminGatedPath(pathname)) {
    const clientIp = getAdminGateClientIp(request)
    if (!adminIpAllowlist.matches(clientIp)) {
      adminIpDenialCount += 1
      if (adminIpDenialCount === 1 || adminIpDenialCount % 100 === 0) {
        // eslint-disable-next-line no-console
        console.warn(
          `[admin-ip-allowlist] denied IP ${clientIp} for path ${pathname}`,
        )
      }
      return new NextResponse("Forbidden", { status: 403 })
    }
  }

  // Marketing host short-circuit: every non-API path on the apex is public,
  // so skip the Supabase auth check entirely. APIs still flow through origin
  // enforcement + the skip list below so /api/waitlist, /api/free-audit etc.
  // continue to work for anonymous visitors.
  if (isMarketingHost && !pathname.startsWith("/api/")) {
    return applyCsp(NextResponse.next({ request: { headers: requestHeaders } }))
  }

  if (publicPaths.some((p) => pathname === p)) {
    return applyCsp(NextResponse.next({ request: { headers: requestHeaders } }))
  }

  // Non-canonical host safety net (Vercel preview deploys, localhost, the
  // old production domain still attached during cutover overlap, vercel.app
  // URLs): the marketing-host short-circuit above only fires on the new
  // canonical apex. On any other host, fall back to a path-based public
  // check - if the path isn't an app path and isn't /api/, treat it as
  // public marketing and skip the auth check so /apply, /free-audit,
  // /about, /security, /blog/*, /verify/*, etc. work without redirecting
  // anonymous visitors to /login.
  if (!isCanonicalHost && !pathname.startsWith("/api/") && !isAppPath(pathname)) {
    return applyCsp(NextResponse.next({ request: { headers: requestHeaders } }))
  }

  // Origin enforcement runs on every mutating /api/ request except the
  // routes called by external origins (Stripe webhook, Vercel cron) or by
  // browser internals (CSP violation reports don't always include Origin).
  // GET/HEAD/OPTIONS pass automatically (see lib/security/origin.ts).
  if (
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/stripe/webhook") &&
    !pathname.startsWith("/api/cron/") &&
    pathname !== "/api/csp-report"
  ) {
    const originBlock = enforceOrigin(request)
    if (originBlock) return applyCsp(originBlock)
  }

  // Auth-check skip: public endpoints that must work for anon visitors.
  // Newsletter capture runs on blog posts served to logged-out readers -
  // without this skip the proxy redirects the POST to /login and the form
  // silently fails.
  if (
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.startsWith("/api/stripe/checkout-guest") ||
    pathname.startsWith("/api/stripe/checkout-beta") ||
    pathname.startsWith("/api/cron/") ||
    pathname.startsWith("/api/demo/") ||
    pathname.startsWith("/api/auth/") ||
    pathname === "/api/waitlist" ||
    pathname === "/api/newsletter" ||
    pathname === "/api/csp-report"
  ) {
    return applyCsp(NextResponse.next({ request: { headers: requestHeaders } }))
  }

  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })
          cookiesToSet.forEach(({ name, value, options }) =>
            // IMPORTANT: do NOT force httpOnly on Supabase auth cookies.
            // @supabase/ssr emits multiple cookies (sb-*-auth-token,
            // sb-*-code-verifier, etc.) and chooses httpOnly per cookie.
            // Forcing httpOnly:true breaks the client SDK silently with the
            // "skeleton stuck forever" symptom and no console errors. See
            // docs/security/cookie-audit-2026-05-20.md and user-memory
            // feedback_supabase_ssr_no_httponly.md for context.
            //
            // We still enforce SameSite=Lax (CSRF defense for cross-site
            // POSTs) and Secure-in-prod (transport guarantee), but trust
            // Supabase's per-cookie httpOnly decision.
            supabaseResponse.cookies.set(name, value, {
              ...options,
              sameSite: options.sameSite ?? "lax",
              secure: process.env.NODE_ENV === "production",
            })
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    // Login lives on the app subdomain. If we somehow ended up here on the
    // marketing host (e.g. an authenticated API call without a session),
    // redirect cross-domain so the user lands on the correct login page.
    if (isMarketingHost) {
      url.host = APP_HOST
      // Drop any port carried over from the original request URL when
      // redirecting cross-host (Vercel never serves on a port).
      url.port = ""
    }
    return applyCsp(NextResponse.redirect(url))
  }

  const impCookie = request.cookies.get(IMPERSONATE_COOKIE)?.value
  if (impCookie && request.method !== "GET" && request.method !== "HEAD") {
    const isAdminPath =
      pathname.startsWith("/api/admin/") || pathname.startsWith("/admin/")
    if (!isAdminPath) {
      const { data: impSession } = await createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { cookies: { getAll: () => [], setAll: () => {} } },
      )
        .from("impersonation_sessions")
        .select("admin_user_id, mode, expires_at")
        .eq("id", impCookie)
        .maybeSingle()

      if (
        impSession &&
        impSession.admin_user_id === user.id &&
        impSession.mode === "read" &&
        new Date(impSession.expires_at as string).getTime() > Date.now()
      ) {
        return applyCsp(
          NextResponse.json(
            { error: "Read-only impersonation - mutations blocked. Stop impersonation to act as yourself." },
            { status: 403 },
          ),
        )
      }
    }
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_complete, subscription_status")
      .eq("id", user.id)
      .single()

    if (profile && !profile.onboarding_complete && !pathname.startsWith("/onboarding")) {
      const url = request.nextUrl.clone()
      url.pathname = "/onboarding/clinic"
      return applyCsp(NextResponse.redirect(url))
    }

    if (
      profile &&
      profile.onboarding_complete &&
      profile.subscription_status !== "active" &&
      pathname.startsWith("/dashboard") &&
      !pathname.startsWith("/dashboard/account")
    ) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard/account"
      return applyCsp(NextResponse.redirect(url))
    }
  }

  return applyCsp(supabaseResponse)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
