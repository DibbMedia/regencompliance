"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Shield, RefreshCw, LifeBuoy } from "lucide-react"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (typeof window !== "undefined" && "console" in window) {
      console.error("[App error boundary]", error)
    }
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
            <Shield className="h-8 w-8 text-red-400" aria-hidden />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
        <p className="text-sm text-white/70 leading-relaxed mb-2">
          An unexpected error prevented this page from loading. This has been
          logged automatically.
        </p>
        {error.digest && (
          <p className="text-xs text-white/45 font-mono mb-6">
            Ref: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-6 text-sm font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_25px_rgba(85,224,57,0.45)] hover:brightness-110 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/dashboard/support"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-6 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <LifeBuoy className="h-4 w-4" />
            Contact support
          </Link>
        </div>
      </div>
    </div>
  )
}
