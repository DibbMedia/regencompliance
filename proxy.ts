import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

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
    return response
  }

  if (publicPaths.some((p) => pathname === p)) {
    return applyCsp(NextResponse.next({ request: { headers: requestHeaders } }))
  }

  if (
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.startsWith("/api/stripe/checkout-guest") ||
    pathname.startsWith("/api/stripe/checkout-beta") ||
    pathname.startsWith("/api/cron/") ||
    pathname.startsWith("/api/demo/") ||
    pathname.startsWith("/api/auth/") ||
    pathname === "/api/waitlist"
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
