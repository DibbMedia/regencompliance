"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import {
  Shield,
  CheckCircle2,
  XCircle,
  Lock,
  KeyRound,
  Mail,
  Download,
  AlertTriangle,
  Loader2,
  LogOut,
  Smartphone,
} from "lucide-react"
import { toast } from "sonner"

interface SecurityEvent {
  id: string
  action: string
  status: "success" | "failure" | "error" | null
  ip_address: string | null
  user_agent: string | null
  details: Record<string, unknown> | null
  created_at: string
}

const ACTION_META: Record<
  string,
  { label: string; icon: typeof Shield; tone: "good" | "bad" | "neutral" }
> = {
  "auth.login.success": { label: "Signed in", icon: CheckCircle2, tone: "good" },
  "auth.login.failed": { label: "Failed sign-in attempt", icon: XCircle, tone: "bad" },
  "auth.login.locked": { label: "Account temporarily locked", icon: Lock, tone: "bad" },
  "auth.reset_password.success": { label: "Password changed", icon: KeyRound, tone: "good" },
  "auth.reset_password.failed": { label: "Failed password reset", icon: KeyRound, tone: "bad" },
  "auth.forgot_password.requested": { label: "Password reset requested", icon: Mail, tone: "neutral" },
  "auth.forgot_password.throttled": { label: "Reset email throttled", icon: Mail, tone: "neutral" },
  "auth.sessions_revoked": { label: "Signed out other devices", icon: LogOut, tone: "good" },
  "account.delete.attempt": { label: "Account-delete attempt", icon: AlertTriangle, tone: "bad" },
  "account.deleted": { label: "Account deleted", icon: AlertTriangle, tone: "bad" },
  "data.exported": { label: "Data export downloaded", icon: Download, tone: "neutral" },
}

const TONE_CLASSES = {
  good: "bg-[#55E039]/10 border-[#55E039]/20 text-[#55E039]",
  bad: "bg-red-500/10 border-red-500/20 text-red-400",
  neutral: "bg-white/[0.04] border-white/10 text-white/60",
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function shortBrowser(ua: string | null): string {
  if (!ua) return "Unknown device"
  if (ua.includes("Edg/")) return "Edge"
  if (ua.includes("Chrome/")) return "Chrome"
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari"
  if (ua.includes("Firefox/")) return "Firefox"
  if (ua.includes("OkHttp")) return "App / API client"
  return "Browser"
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  const diff = Date.now() - date.getTime()
  if (diff < 60_000) return "Just now"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hr ago`
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} days ago`
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

export default function SecurityActivityPage() {
  const { data, error, isLoading, mutate } = useSWR<{ events: SecurityEvent[] }>(
    "/api/account/security-events",
    fetcher,
    { refreshInterval: 60000 },
  )
  const [revoking, setRevoking] = useState(false)
  // useMemo so the events identity is stable across renders that don't
  // change `data` - keeps the recent-fails effect from re-running and
  // calms react-hooks/exhaustive-deps.
  const events = useMemo(() => data?.events ?? [], [data?.events])

  // Surface a one-time toast if the most recent failed-login is unfamiliar.
  // Pre-2026-05-05 there was no in-app surface for this; users had no way
  // to spot account-takeover attempts.
  const [warned, setWarned] = useState(false)
  useEffect(() => {
    if (warned || isLoading || events.length === 0) return
    const recentFails = events.filter(
      (e) =>
        e.action === "auth.login.failed" &&
        Date.now() - new Date(e.created_at).getTime() < 24 * 60 * 60 * 1000,
    )
    if (recentFails.length >= 3) {
      toast.warning("Multiple failed sign-in attempts in the last 24h", {
        description: "If you didn't try to sign in, change your password and sign out other devices.",
      })
      // One-shot warning toast - the warned guard above prevents
      // re-fire, so this is safe despite the rule's caution.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWarned(true)
    }
  }, [events, isLoading, warned])

  async function handleSignOutOthers() {
    setRevoking(true)
    const res = await fetch("/api/account/sign-out-others", { method: "POST" })
    setRevoking(false)
    if (!res.ok) {
      toast.error("Failed to sign out other sessions.")
      return
    }
    toast.success("Other sessions signed out.")
    mutate()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Security activity</h1>
        <p className="mt-1 text-sm text-white/60 max-w-2xl">
          The last 50 sign-ins, password resets, and account events tied to your email. Anything you don&apos;t recognize is worth investigating.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-[#55E039]/10 border border-[#55E039]/20 p-2">
              <Smartphone className="h-5 w-5 text-[#55E039]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Sign out other devices</p>
              <p className="mt-1 text-xs text-white/55 max-w-md">
                Keeps you signed in here and revokes every other browser/device. Safer than changing your password if you suspect an unfamiliar sign-in.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOutOthers}
            disabled={revoking}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/[0.08] transition-all disabled:opacity-50"
          >
            {revoking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Revoking...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Sign out others
              </>
            )}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="border-b border-white/10 px-5 sm:px-6 py-4">
          <p className="text-xs font-bold text-white/50 uppercase tracking-[0.2em]">Recent activity</p>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-white/40" />
          </div>
        ) : error ? (
          <div className="px-5 sm:px-6 py-10 text-center text-sm text-red-400">
            Couldn&apos;t load activity. Refresh to retry.
          </div>
        ) : events.length === 0 ? (
          <div className="px-5 sm:px-6 py-10 text-center text-sm text-white/50">
            No recorded activity yet. Sign in from a different device to see it here.
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {events.map((event) => {
              const meta = ACTION_META[event.action] ?? {
                label: event.action,
                icon: Shield,
                tone: "neutral" as const,
              }
              const Icon = meta.icon
              return (
                <li key={event.id} className="px-5 sm:px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-lg border ${TONE_CLASSES[meta.tone]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="text-sm font-semibold text-white">{meta.label}</p>
                        <span className="text-xs text-white/40">{formatTime(event.created_at)}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-white/55">
                        {event.ip_address ? `IP ${event.ip_address}` : "Unknown IP"}
                        {" - "}
                        {shortBrowser(event.user_agent)}
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <p className="text-[11px] text-white/40 leading-relaxed">
        Activity is part of the audit trail used for compliance evidence. We retain login + account events for 90 days. Data exports and account deletions are retained per the privacy policy.
      </p>
    </div>
  )
}
