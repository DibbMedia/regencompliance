function layout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="padding:0 0 32px 0;">
          <span style="font-size:20px;font-weight:700;color:#55E039;letter-spacing:0.05em;">REGEN</span><span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.05em;">COMPLIANCE</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="background-color:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:32px 0 0 0;text-align:center;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.35);line-height:1.6;">
            RegenCompliance by Dibb Enterprises LLC<br />
            <a href="https://compliance.regenportal.com" style="color:rgba(255,255,255,0.35);text-decoration:underline;">compliance.regenportal.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function ctaButton(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#55E039,#3BB82A);color:#0a0a0a;font-weight:700;font-size:14px;text-decoration:none;border-radius:8px;margin-top:8px;">${text}</a>`
}

export function welcomeEmail(clinicName: string): { subject: string; html: string } {
  return {
    subject: "Welcome to RegenCompliance!",
    html: layout(`
      <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#ffffff;">Welcome aboard, ${clinicName}!</h1>
      <p style="margin:0 0 16px 0;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">
        Your RegenCompliance Pro subscription is now active. You have full access to our compliance scanner, real-time rule monitoring, and team collaboration tools.
      </p>
      <p style="margin:0 0 24px 0;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">
        Start by scanning your clinic&rsquo;s marketing content to identify compliance risks before regulators do.
      </p>
      ${ctaButton("Go to Scanner", "https://compliance.regenportal.com/dashboard/scanner")}
    `),
  }
}

export function betaWelcomeEmail(clinicName: string): { subject: string; html: string } {
  return {
    subject: "Beta Access Activated — Welcome, Founding Member!",
    html: layout(`
      <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#ffffff;">Welcome, Founding Member!</h1>
      <p style="margin:0 0 8px 0;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">
        <strong style="color:#55E039;">${clinicName}</strong> now has lifetime beta access to RegenCompliance. No monthly fees, ever.
      </p>
      <p style="margin:0 0 16px 0;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">
        As a founding member, you&rsquo;ll get early access to every new feature and direct input on our roadmap. Your feedback shapes the product.
      </p>
      <p style="margin:0 0 24px 0;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">
        Jump in and scan your first piece of marketing content now.
      </p>
      ${ctaButton("Start Scanning", "https://compliance.regenportal.com/dashboard/scanner")}
    `),
  }
}

export function paymentFailedEmail(clinicName: string): { subject: string; html: string } {
  return {
    subject: "Action Required: Payment Failed",
    html: layout(`
      <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#ffffff;">Payment Failed</h1>
      <p style="margin:0 0 16px 0;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">
        Hi ${clinicName}, your latest payment for RegenCompliance Pro could not be processed. Please update your payment method to keep your subscription active.
      </p>
      <p style="margin:0 0 24px 0;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">
        If your payment method is not updated, your access may be interrupted.
      </p>
      ${ctaButton("Update Payment Method", "https://compliance.regenportal.com/dashboard/account")}
    `),
  }
}

export function subscriptionCancelledEmail(clinicName: string): { subject: string; html: string } {
  return {
    subject: "Your Subscription Has Been Cancelled",
    html: layout(`
      <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#ffffff;">Subscription Cancelled</h1>
      <p style="margin:0 0 16px 0;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">
        Hi ${clinicName}, your RegenCompliance Pro subscription has been cancelled. Your existing scan history and data will remain accessible.
      </p>
      <p style="margin:0 0 24px 0;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">
        If you&rsquo;d like to resubscribe at any time, you can do so from your account page.
      </p>
      ${ctaButton("Resubscribe", "https://compliance.regenportal.com/dashboard/account")}
    `),
  }
}

export function dataExportEmail(clinicName: string, downloadUrl: string): { subject: string; html: string } {
  return {
    subject: "Your Data Export Is Ready",
    html: layout(`
      <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#ffffff;">Data Export Complete</h1>
      <p style="margin:0 0 16px 0;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">
        Hi ${clinicName}, your data export from RegenCompliance has been generated and downloaded. This export includes all of your profile data, scans, tickets, notifications, and team member records.
      </p>
      <p style="margin:0 0 24px 0;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">
        If you did not request this export, please secure your account immediately.
      </p>
      ${ctaButton("Go to Account", downloadUrl)}
    `),
  }
}

export function accountDeletedEmail(clinicName: string): { subject: string; html: string } {
  return {
    subject: "Your Account Has Been Deleted",
    html: layout(`
      <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#ffffff;">Account Deleted</h1>
      <p style="margin:0 0 16px 0;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">
        Hi ${clinicName}, your RegenCompliance account and all associated data have been permanently deleted. This action cannot be undone.
      </p>
      <p style="margin:0 0 16px 0;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">
        If you ever want to use RegenCompliance again, you&rsquo;re welcome to create a new account.
      </p>
      <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">
        Thank you for being a RegenCompliance user.
      </p>
    `),
  }
}
