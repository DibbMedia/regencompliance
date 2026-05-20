import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Suppress Next.js's default `X-Powered-By: Next.js` response header.
  // The header gives an attacker free version-fingerprinting; the
  // isitsecure.ai scan flagged it as info disclosure on 2026-05-06.
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "0" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://js.stripe.com\"), usb=(), accelerometer=(), gyroscope=(), magnetometer=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          // Generic Server header overrides Vercel's "Vercel" fingerprint
          // where possible. Vercel's edge may still append its own; this
          // is a best-effort obfuscation rather than a hard guarantee.
          // (CSP is set per-request in proxy.ts with a nonce - don't
          // duplicate it here or browsers will see two CSP headers.)
          { key: "Server", value: "web" },
        ],
      },
    ]
  },
}

// Sentry wiring was removed alongside lib/error-tracking.ts - see the
// docstring there. Re-add `withSentryConfig` here when the operator
// commits to wiring a remote error tracker; until then there's no
// reason to gate a config wrapper on an env var that nothing reads.

export default nextConfig
