import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const publicPaths = ["/", "/login", "/auth/callback", "/demo", "/features", "/pricing", "/faq", "/waitlist"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some((p) => pathname === p)) {
    return NextResponse.next()
  }

  // Allow API routes that handle their own auth (webhooks, cron)
  if (pathname.startsWith("/api/stripe/webhook") || pathname.startsWith("/api/stripe/checkout-guest") || pathname.startsWith("/api/cron/") || pathname.startsWith("/api/demo/") || pathname === "/api/waitlist") {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

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
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Not authenticated — redirect to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Check onboarding status for dashboard routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_complete, subscription_status")
      .eq("id", user.id)
      .single()

    // Not onboarded — redirect to onboarding (unless already there)
    if (profile && !profile.onboarding_complete && !pathname.startsWith("/onboarding")) {
      const url = request.nextUrl.clone()
      url.pathname = "/onboarding/clinic"
      return NextResponse.redirect(url)
    }

    // Onboarded but no subscription — only allow account page
    if (
      profile &&
      profile.onboarding_complete &&
      profile.subscription_status !== "active" &&
      pathname.startsWith("/dashboard") &&
      !pathname.startsWith("/dashboard/account")
    ) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard/account"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
