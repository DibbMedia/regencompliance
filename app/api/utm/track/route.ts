import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { z } from "zod"
import {
  UTM_COOKIE_NAME,
  hasAnyUtm,
  parseUtmFromUrl,
  serializeUtmCookie,
} from "@/lib/utm"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"

/**
 * POST /api/utm/track
 *
 * Client `<UtmTracker />` posts here on first paint when the URL contains
 * any utm_* param. We never error on malformed input: this endpoint is
 * called optimistically by the browser and a 4xx/5xx would surface in
 * client error reporting and dirty up dashboards. Always 204.
 *
 * Cookie attributes (locked contract):
 *   HttpOnly, SameSite=Lax, Secure in prod, Path=/, Max-Age=2592000 (30d)
 *
 * Rate limit: 60/min/IP. Best-effort - this is a low-cost endpoint and the
 * `checkRateLimit` helper degrades open if the RPC is unavailable.
 */

export const maxDuration = 5

const trackBodySchema = z.object({
  params: z.record(z.string(), z.string()).optional().default({}),
  referrer: z.string().nullable().optional(),
  landing_path: z.string().nullable().optional(),
})

const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60 // 2592000

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    // Best-effort rate limit; ignore failures so attribution loss never
    // becomes a UX issue. checkRateLimit already degrades open on RPC
    // errors for non-expensive prefixes.
    const limit = await checkRateLimit(`utm-track:${ip}`, 60, 60 * 1000)
    if (!limit.allowed) {
      // Still 204 - we don't want the client to retry or surface noise.
      return new NextResponse(null, { status: 204 })
    }

    const raw = (await request.json().catch(() => null)) as unknown
    const parsed = trackBodySchema.safeParse(raw)
    if (!parsed.success) {
      return new NextResponse(null, { status: 204 })
    }

    const { params, referrer, landing_path } = parsed.data

    // Build a synthetic URL so we can reuse parseUtmFromUrl as the single
    // canonical parse path. Origin doesn't matter (we only read pathname
    // + searchParams) but URL parsing requires one.
    const landing = typeof landing_path === "string" && landing_path.length > 0
      ? landing_path
      : "/"
    let synthetic: URL
    try {
      // landing may not start with "/"; URL constructor with a base
      // tolerates either by resolving against the base.
      synthetic = new URL(landing, "https://internal.invalid")
    } catch {
      return new NextResponse(null, { status: 204 })
    }
    // Layer the body params onto the synthetic URL so parseUtmFromUrl
    // sees them via searchParams.
    for (const [k, v] of Object.entries(params ?? {})) {
      if (typeof k === "string" && typeof v === "string") {
        synthetic.searchParams.set(k, v)
      }
    }

    const payload = parseUtmFromUrl(synthetic, referrer ?? null)
    if (!hasAnyUtm(payload)) {
      // Honor the contract: don't overwrite an existing cookie when the
      // client didn't actually carry any utm_* data.
      return new NextResponse(null, { status: 204 })
    }

    const cookieStore = await cookies()
    cookieStore.set(UTM_COOKIE_NAME, serializeUtmCookie(payload), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOKIE_MAX_AGE_SECONDS,
    })

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    // Per contract: never error. Log and 204 so the client tracker is
    // never visible in error dashboards.
    console.error("[utm/track] unexpected error:", err)
    return new NextResponse(null, { status: 204 })
  }
}
