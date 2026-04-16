// @ts-nocheck
import * as Sentry from "@sentry/nextjs"

const SENSITIVE_PATHS = ["/api/scan", "/api/scan-url", "/api/scan-file", "/api/demo/", "/api/rewrite", "/api/tickets"]

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0,
  environment: process.env.NODE_ENV,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  sendDefaultPii: false,
  integrations: [
    Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
  ],
  beforeSend(event) {
    const url = event.request?.url ?? ""
    if (SENSITIVE_PATHS.some((p) => url.includes(p))) {
      if (event.request) {
        delete event.request.data
        delete event.request.query_string
        delete event.request.cookies
      }
    }
    if (event.user) {
      delete event.user.email
      delete event.user.ip_address
    }
    return event
  },
})
