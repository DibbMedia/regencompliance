// Launch announcement email sent to every waitlist signup when the site goes live.
// Delivers an early-access promo code redeemable at Stripe checkout.

interface LaunchEmailParams {
  name: string
  promoCode: string
  appUrl: string
}

export const LAUNCH_EMAIL_SUBJECT =
  "You're in — 20% off forever as a RegenCompliance early-access member"

export function renderLaunchEmail({ name, promoCode, appUrl }: LaunchEmailParams): string {
  const firstName = (name || "").trim().split(/\s+/)[0] || "there"
  const checkoutUrl = `${appUrl.replace(/\/$/, "")}/pricing`

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>RegenCompliance — You're in</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#ffffff;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0a0a0a;">
      <tr>
        <td align="center" style="padding:48px 16px;">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;width:100%;background-color:#111111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:40px 40px 24px 40px;text-align:left;">
                <div style="display:inline-block;padding:6px 14px;background-color:rgba(85,224,57,0.1);border:1px solid rgba(85,224,57,0.25);border-radius:999px;font-size:11px;font-weight:700;color:#55E039;letter-spacing:0.2em;text-transform:uppercase;">
                  You're in
                </div>
                <h1 style="margin:20px 0 12px 0;font-size:28px;line-height:1.2;font-weight:800;color:#ffffff;">
                  RegenCompliance is live.
                </h1>
                <p style="margin:0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.7);">
                  Hi ${escapeHtml(firstName)}, thanks for joining the waitlist. The compliance scanner, AI rewriter, daily FDA/FTC rule updates, audit trail, and team seats are all open to you today.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 40px;">
                <div style="border-top:1px solid rgba(255,255,255,0.08);"></div>
              </td>
            </tr>

            <tr>
              <td style="padding:32px 40px 8px 40px;">
                <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;color:#55E039;letter-spacing:0.2em;text-transform:uppercase;">
                  Your early-access code
                </p>
                <div style="margin:12px 0 16px 0;padding:20px;background-color:rgba(85,224,57,0.06);border:1px solid rgba(85,224,57,0.25);border-radius:12px;text-align:center;">
                  <div style="font-family:'SFMono-Regular',Consolas,'Liberation Mono',monospace;font-size:24px;font-weight:800;letter-spacing:0.12em;color:#55E039;">
                    ${escapeHtml(promoCode)}
                  </div>
                </div>
                <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.6);">
                  Redeem it at checkout to lock in <strong style="color:#ffffff;">20% off every month, forever</strong>. This offer is only going out to waitlist members.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 40px 40px 40px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="left">
                      <a href="${escapeHtml(checkoutUrl)}" style="display:inline-block;padding:14px 28px;background:linear-gradient(90deg,#55E039 0%,#3BB82A 100%);color:#0a0a0a;text-decoration:none;font-size:15px;font-weight:700;border-radius:12px;box-shadow:0 4px 20px rgba(85,224,57,0.3);">
                        Claim your discount →
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0 0;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.5);">
                  Click <strong style="color:rgba(255,255,255,0.75);">Add promotion code</strong> on the Stripe checkout page and paste <strong style="color:#55E039;">${escapeHtml(promoCode)}</strong>.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 40px;">
                <div style="border-top:1px solid rgba(255,255,255,0.08);"></div>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 40px 40px 40px;">
                <p style="margin:0 0 8px 0;font-size:13px;font-weight:700;color:#ffffff;">
                  What you get
                </p>
                <p style="margin:0;font-size:13px;line-height:1.7;color:rgba(255,255,255,0.6);">
                  • Unlimited FDA/FTC compliance scans<br />
                  • One-click compliant AI rewrites<br />
                  • 300+ rule library, updated daily<br />
                  • Full audit trail + PDF export<br />
                  • 3 team seats included
                </p>
              </td>
            </tr>
          </table>

          <p style="margin:24px 0 0 0;font-size:12px;color:rgba(255,255,255,0.35);max-width:560px;">
            You're receiving this because you joined the RegenCompliance waitlist. Questions? Reply to this email and isaac@dibbenterprizes.com will get back to you.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
