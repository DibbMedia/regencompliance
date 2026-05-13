import { NextResponse } from "next/server"
import { verifyDeveloperAdmin } from "@/lib/admin"
import { sendEmail } from "@/lib/email"
import { renderLaunchEmail, LAUNCH_EMAIL_SUBJECT } from "@/lib/emails/launch-announcement"
import { listUnsentWaitlist, markWaitlistLaunchSent } from "@/lib/repos/waitlist"

export const maxDuration = 300

export async function POST() {
  // Developer-only: a compromised support admin should not be able to
  // broadcast to the entire waitlist. Combined with the per-email idempotency
  // (launch_email_sent_at is set after first send), the blast radius is
  // bounded but the action is still high-impact.
  const auth = await verifyDeveloperAdmin()
  if ("error" in auth) return auth.error

  const { serviceClient } = auth

  // Server-only EARLY_ACCESS_CODE.
  const promoCode = process.env.EARLY_ACCESS_CODE?.trim()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!promoCode || !appUrl) {
    return NextResponse.json(
      {
        error:
          "Missing EARLY_ACCESS_CODE or NEXT_PUBLIC_APP_URL. Set them in Vercel and redeploy before sending.",
      },
      { status: 500 }
    )
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not set. Cannot send launch emails." },
      { status: 500 }
    )
  }

  // Per plan §6 "send-launch": email is decrypted server-side here. This is
  // the documented plaintext-in-transit point - emails leave the database
  // boundary at email-send time.
  let entries
  try {
    entries = await listUnsentWaitlist(serviceClient)
  } catch (err) {
    console.error("[send-launch] fetch error:", err)
    return NextResponse.json({ error: "Failed to read waitlist" }, { status: 500 })
  }

  let sent = 0
  const errors: { email: string; reason: string }[] = []

  for (const entry of entries) {
    try {
      const html = renderLaunchEmail({
        name: entry.name || "",
        promoCode,
        appUrl,
      })

      const result = await sendEmail(entry.email, LAUNCH_EMAIL_SUBJECT, html)
      if (!result) {
        errors.push({ email: entry.email, reason: "Resend returned null (see server logs)" })
        continue
      }

      try {
        await markWaitlistLaunchSent(serviceClient, entry.id)
      } catch (updateError) {
        const msg = updateError instanceof Error ? updateError.message : "unknown error"
        errors.push({ email: entry.email, reason: `DB update failed: ${msg}` })
        continue
      }

      sent++
      // Small delay to stay under Resend's 10 req/sec default rate limit
      await new Promise((r) => setTimeout(r, 110))
    } catch (e) {
      const message = e instanceof Error ? e.message : "unknown error"
      errors.push({ email: entry.email, reason: message })
    }
  }

  return NextResponse.json({
    total: entries.length,
    sent,
    failed: errors.length,
    errors: errors.slice(0, 20),
  })
}
