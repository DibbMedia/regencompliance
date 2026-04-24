import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import { sendEmail } from "@/lib/email"
import { renderLaunchEmail, LAUNCH_EMAIL_SUBJECT } from "@/lib/emails/launch-announcement"

export const maxDuration = 300

export async function POST() {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error

  const { serviceClient } = auth

  // Prefer server-only EARLY_ACCESS_CODE; tolerate the legacy NEXT_PUBLIC_
  // variant until the Vercel env rename lands.
  const promoCode =
    process.env.EARLY_ACCESS_CODE?.trim() ||
    process.env.NEXT_PUBLIC_EARLY_ACCESS_CODE?.trim()
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

  const { data: pending, error: fetchError } = await serviceClient
    .from("waitlist")
    .select("id, name, email")
    .is("launch_email_sent_at", null)
    .order("created_at", { ascending: true })

  if (fetchError) {
    console.error("[send-launch] fetch error:", fetchError)
    return NextResponse.json({ error: "Failed to read waitlist" }, { status: 500 })
  }

  const entries = pending || []
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

      const { error: updateError } = await serviceClient
        .from("waitlist")
        .update({ launch_email_sent_at: new Date().toISOString() })
        .eq("id", entry.id)

      if (updateError) {
        errors.push({ email: entry.email, reason: `DB update failed: ${updateError.message}` })
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
