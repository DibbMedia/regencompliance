import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { enforceOrigin } from "@/lib/security/origin"

const IMPERSONATE_COOKIE = "regen_impersonate"

const publicPaths = ["/", "/login", "/auth/callback", "/demo", "/features", "/pricing", "/faq", "/waitlist", "/privacy", "/terms", "/forgot-password", "/auth/reset-password"]

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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const nonce = generateNonce()
  const csp = buildCsp(nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("Content-Security-Policy", csp)

  const applyCsp = (response: NextResponse): NextResponse => {
    response.headers.set("Content-Security-Policy", csp)
    response.headers.set("x-nonce", nonce)
    // Reporting-Endpoints names the endpoint referenced by `report-to` in CSP.
    // Must be a same-origin absolute or a relative URL on HTTPS.
    response.headers.set(
      "Reporting-Endpoints",
      'csp-endpoint="/api/csp-report"',
    )
    return response
  }

  if (publicPaths.some((p) => pathname === p)) {
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
