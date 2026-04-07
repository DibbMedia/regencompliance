import { Resend } from "resend"

let resend: Resend | null = null

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

const FROM_EMAIL = process.env.FROM_EMAIL || "RegenCompliance <noreply@regenportal.com>"

export async function sendEmail(to: string, subject: string, html: string) {
  const client = getResend()
  if (!client) {
    console.warn("[Email] RESEND_API_KEY not set, skipping email:", subject)
    return null
  }

  try {
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })

    if (error) {
      console.error("[Email] Send failed:", error)
      return null
    }

    return data
  } catch (e) {
    console.error("[Email] Error:", e)
    return null
  }
}
