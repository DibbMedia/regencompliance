import { NextResponse } from "next/server"
import { contactFormSchema } from "@/lib/validations"
import { checkRateLimit } from "@/lib/rate-limit"
import { getClientIp } from "@/lib/ip"
import { sendToGhl } from "@/lib/ghl"

export const maxDuration = 10

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)

    // Global cap protects the GHL pipeline from a flood of bogus messages.
    const global = await checkRateLimit("contact-form-global", 200, 60 * 60 * 1000)
    if (!global.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status: 429 },
      )
    }

    // Per-IP: 5 messages per 10 minutes. Tight enough to deter spam, loose
    // enough that a customer fixing a typo can resend.
    const limit = await checkRateLimit(`contact-form:${ip}`, 5, 10 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status: 429 },
      )
    }

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const parsed = contactFormSchema.safeParse(body)
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return NextResponse.json(
        { error: first?.message || "Invalid input" },
        { status: 400 },
      )
    }

    const { name, email, company, subject, message } = parsed.data

    // GHL is the system of record for contact submissions per the project's
    // email policy. Fire-and-forget into the contact-form workflow; we don't
    // store the message in Supabase.
    void sendToGhl("contact_form", {
      email,
      name,
      company: company || null,
      subject,
      message,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Contact form route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
