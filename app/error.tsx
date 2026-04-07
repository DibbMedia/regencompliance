"use client"

import { Shield, RefreshCw } from "lucide-react"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
            <Shield className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-sm text-white/40 mb-6">
          An unexpected error occurred. Please try again or contact support if the issue persists.
        </p>
        <button
          onClick={reset}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-6 text-sm font-semibold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_25px_rgba(85,224,57,0.45)] hover:brightness-110 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  )
}
