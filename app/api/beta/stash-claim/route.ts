// Stash the beta reservation_token from the Stripe checkout success_url
// (?claim=<token>) into a short-lived cookie before the user lands on
// email verification. /auth/callback reads the cookie to claim the
// beta_purchases row by token (plan §12.2) without ever consulting email.
//
// Design choice: server-set cookie rather than document.cookie from the
// login/signup page. Reasoning:
//   - Single, auditable place to apply Path/SameSite/Secure/Max-Age
//   - UUID validation runs server-side so the cookie never carries garbage
//   - Cookie can stay readable by both server (auth callback) and client
//     because we set httpOnly:false per the Wave 2E brief; the value is a
//     reservation_token, not credential material
//
// The login page POSTs here in a useEffect when ?claim=<token> is on the
// URL. Idempotent: re-stash overwrites with the same value.

import { NextResponse } from "next/server"
import { isValidUUID } from "@/lib/validations"

export const maxDuration = 5

const CLAIM_COOKIE_NAME = "rc_beta_claim"
const CLAIM_TTL_SECONDS = 30 * 60 // 30 minutes

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const token =
    body && typeof body === "object" && "claim" in body
      ? (body as { claim: unknown }).claim
      : null

  if (typeof token !== "string" || !isValidUUID(token)) {
    return NextResponse.json({ error: "Invalid claim token" }, { status: 400 })
  }

  const isProd = process.env.NODE_ENV === "production"
  const response = NextResponse.json({ stashed: true })
  response.cookies.set({
    name: CLAIM_COOKIE_NAME,
    value: token,
    httpOnly: false, // Wave 2E brief: client may read; value is non-credential
    path: "/",
    sameSite: "lax",
    secure: isProd,
    maxAge: CLAIM_TTL_SECONDS,
  })
  return response
}
