"use client"

import { useEffect, useRef, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"

const IDLE_TIMEOUT_MS = 60 * 60 * 1000 // 60 minutes
const WARNING_BEFORE_MS = 5 * 60 * 1000 // Show warning 5 min before timeout

export function SessionTimeout() {
  const router = useRouter()
  const [showWarning, setShowWarning] = useState(false)
  const lastActivity = useRef(Date.now())
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function resetTimers() {
      lastActivity.current = Date.now()
      setShowWarning(false)

      if (warningTimer.current) clearTimeout(warningTimer.current)
      if (logoutTimer.current) clearTimeout(logoutTimer.current)

      warningTimer.current = setTimeout(() => {
        setShowWarning(true)
      }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS)

      logoutTimer.current = setTimeout(() => {
        handleLogout()
      }, IDLE_TIMEOUT_MS)
    }

    async function handleLogout() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.auth.signOut()
      router.push("/login?error=session_expired")
    }

    // Track user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart"]
    events.forEach((e) => window.addEventListener(e, resetTimers, { passive: true }))

    // Start timers
    resetTimers()

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimers))
      if (warningTimer.current) clearTimeout(warningTimer.current)
      if (logoutTimer.current) clearTimeout(logoutTimer.current)
    }
  }, [router])

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="rounded-2xl bg-[#111111] border border-white/10 p-8 max-w-sm mx-4 text-center shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Session Expiring</h3>
        <p className="text-sm text-white/60 mb-6">
          Your session will expire in 5 minutes due to inactivity. Move your mouse or press any key to stay signed in.
        </p>
        <button
          onClick={() => {
            // Any interaction resets timers via the event listeners
            setShowWarning(false)
          }}
          className="h-10 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-6 text-sm font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:brightness-110 transition-all cursor-pointer"
        >
          Stay Signed In
        </button>
      </div>
    </div>
  )
}
