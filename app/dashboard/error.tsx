"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-sm text-white/40 mb-6">
          An error occurred while loading this page. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#55E039]/20 bg-[#55E039]/[0.04] px-5 text-sm font-medium text-[#55E039] hover:bg-[#55E039]/10 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  )
}
