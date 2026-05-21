"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Check localStorage first for instant hydration (no flash)
    const stored = localStorage.getItem("cookie_consent")
    if (stored) return

    // Fallback: check the cookie
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("cookie_consent="))
    if (cookie) {
      localStorage.setItem("cookie_consent", cookie.split("=")[1])
      return
    }

    // No consent recorded - show banner. One-shot mount-time setState
    // is required for SSR (localStorage isn't available on the server).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true)
  }, [])

  function handleConsent(value: "accepted" | "declined") {
    // Set cookie (1 year expiry).
    //
    // Attrs: SameSite=Lax (consent decision is non-sensitive but we still
    // want CSRF hygiene), Secure when the page itself is served over HTTPS
    // (i.e. anywhere but localhost). HttpOnly is N/A here because the
    // banner re-reads the cookie from document.cookie on next visit before
    // hitting localStorage. See docs/security/cookie-audit-2026-05-20.md.
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1)
    const secureFlag =
      typeof window !== "undefined" && window.location.protocol === "https:"
        ? "; Secure"
        : ""
    document.cookie = `cookie_consent=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secureFlag}`

    // Mirror to localStorage for instant hydration on next visit
    localStorage.setItem("cookie_consent", value)

    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-x-0 z-[100] p-4 sm:p-6"
      style={{ bottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-3xl rounded-2xl bg-[#111111]/95 backdrop-blur-md border border-white/10 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
        <p className="text-sm text-white/70 leading-relaxed flex-1">
          We set a cookie to keep you logged in and use Vercel Analytics for
          aggregate page-view counts. No third-party tracking pixels. Full
          details in our{" "}
          <Link href="/privacy" className="text-[#55E039] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => handleConsent("declined")}
            className="h-11 sm:h-9 rounded-lg border border-white/10 bg-transparent px-5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            Decline
          </button>
          <button
            onClick={() => handleConsent("accepted")}
            className="h-11 sm:h-9 rounded-lg bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-5 text-sm font-bold text-[#0a0a0a] shadow-[0_2px_12px_rgba(85,224,57,0.3)] hover:brightness-110 transition-all cursor-pointer"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
