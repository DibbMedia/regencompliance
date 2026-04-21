"use client"

import { useEffect, useState } from "react"
import { Eye, X, AlertTriangle } from "lucide-react"

interface ActiveBanner {
  target_email: string | null
  mode: "read" | "write"
  expires_at: string
}

export function ImpersonationBanner() {
  const [active, setActive] = useState<ActiveBanner | null>(null)
  const [stopping, setStopping] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch("/api/admin/impersonate", { method: "GET" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return
        if (data?.active) setActive(data.active)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  async function stop() {
    setStopping(true)
    await fetch("/api/admin/impersonate", { method: "DELETE" })
    window.location.href = "/admin/users"
  }

  if (!active) return null

  return (
    <div className="sticky top-0 z-50 flex items-center gap-3 border-b border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm backdrop-blur">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-yellow-500/20">
        {active.mode === "write" ? (
          <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
        ) : (
          <Eye className="h-3.5 w-3.5 text-yellow-400" />
        )}
      </div>
      <span className="font-medium text-yellow-200">
        Viewing as <span className="font-mono">{active.target_email ?? "unknown"}</span>
      </span>
      <span className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-300">
        {active.mode === "write" ? "Full write" : "Read only"}
      </span>
      <span className="ml-auto text-xs text-yellow-100/80">
        expires {new Date(active.expires_at).toLocaleTimeString()}
      </span>
      <button
        onClick={stop}
        disabled={stopping}
        className="inline-flex items-center gap-1 rounded-md border border-yellow-500/40 bg-yellow-500/20 px-2.5 py-1 text-xs font-medium text-yellow-100 hover:bg-yellow-500/30 disabled:opacity-50"
      >
        <X className="h-3 w-3" />
        Stop
      </button>
    </div>
  )
}
