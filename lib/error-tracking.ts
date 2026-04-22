/**
 * Lightweight error tracking utility.
 * Logs errors to console and forwards to Sentry when available.
 * Works on both client and server side.
 */
export function captureError(error: unknown, context?: Record<string, unknown>) {
  console.error("[Error]", error, context)

  try {
    // Dynamic require works on both client and server
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require("@sentry/nextjs")
    if (Sentry?.captureException) {
      Sentry.captureException(error, { extra: context })
    }
  } catch {
    // Sentry not installed - already logged to console
  }
}
