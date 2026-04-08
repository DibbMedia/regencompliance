import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Note: 'unsafe-eval' removed for production security. If Next.js dev mode breaks, re-add only in development.
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.anthropic.com https://*.sentry.io; frame-src 'self' https://js.stripe.com https://hooks.stripe.com;" },
        ],
      },
    ]
  },
}

// Wrap with Sentry if @sentry/nextjs is installed and DSN is configured
let finalConfig: NextConfig = nextConfig
try {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { withSentryConfig } = require("@sentry/nextjs")
    finalConfig = withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    })
  }
} catch {
  // @sentry/nextjs not installed — skip Sentry build integration
}

export default finalConfig
