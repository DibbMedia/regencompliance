"use client"

import { useEffect } from "react"

/**
 * UtmTracker
 *
 * Renders nothing. On first paint, inspects `window.location.search` and
 * - if any `utm_*` param is present - POSTs them (plus `document.referrer`
 * and `window.location.pathname`) to `/api/utm/track`, which sets the
 * `rc_utm` HttpOnly cookie.
 *
 * Design rules:
 *   - Runs exactly once per mount (empty deps).
 *   - No-op when no utm_* params are present (do NOT overwrite a prior
 *     attribution cookie just because someone hit the homepage with a
 *     bare URL).
 *   - Never throws: any error is swallowed so a flaky network never
 *     breaks the page.
 *   - Mounted from `app/layout.tsx` so it's live on every route.
 */
export function UtmTracker(): null {
  useEffect(() => {
    try {
      if (typeof window === "undefined") return
      const search = window.location.search
      if (!search || search.length <= 1) return

      const sp = new URLSearchParams(search)
      const params: Record<string, string> = {}
      let hasAny = false
      for (const [key, value] of sp.entries()) {
        if (key.startsWith("utm_")) {
          params[key] = value
          hasAny = true
        }
      }
      if (!hasAny) return

      const body = JSON.stringify({
        params,
        referrer: document.referrer || null,
        landing_path: window.location.pathname,
      })

      // Fire-and-forget. We deliberately don't await or surface errors:
      // attribution is best-effort and must not affect page UX.
      void fetch("/api/utm/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        // keepalive lets the request survive a fast subsequent navigation.
        keepalive: true,
      }).catch(() => {
        // Swallow - attribution failure is non-fatal.
      })
    } catch {
      // Swallow - never throw to React from a tracker.
    }
  }, [])

  return null
}

export default UtmTracker
