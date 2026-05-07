import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { enforceOrigin } from "@/lib/security/origin"

const IMPERSONATE_COOKIE = "regen_impersonate"

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

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https: data:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.anthropic.com https://*.sentry.io https://*.vercel-insights.com https://vitals.vercel-insights.com",
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
    return response
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
            supabaseResponse.cookies.set(name, value, {
              ...options,
              sameSite: "lax",
              httpOnly: true,
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
