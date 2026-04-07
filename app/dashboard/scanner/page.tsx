"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Shield, Loader2, Copy, Check, RefreshCw, CheckCircle2, Sparkles, FileText, Share2, Megaphone, Mail, Clapperboard, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ScanFlag } from "@/lib/types"

const CONTENT_TYPES = [
  { value: "website_copy", label: "Website", icon: FileText },
  { value: "social_post", label: "Social", icon: Share2 },
  { value: "ad_copy", label: "Ad Copy", icon: Megaphone },
  { value: "email", label: "Email", icon: Mail },
  { value: "script", label: "Script", icon: Clapperboard },
  { value: "other", label: "Other", icon: MoreHorizontal },
]

interface ScanResult {
  id: string
  compliance_score: number
  summary: string
  flags: ScanFlag[]
  flag_count: number
  high_risk_count: number
  medium_risk_count: number
  low_risk_count: number
  scan_duration_ms: number
  rewritten_text?: string | null
}

function ScoreRing({ score, animate }: { score: number; animate: boolean }) {
  const color = score >= 80 ? "#55E039" : score >= 50 ? "#eab308" : "#ef4444"
  const textColor = score >= 80 ? "text-[#55E039]" : score >= 50 ? "text-yellow-500" : "text-red-500"
  const circumference = 2 * Math.PI * 45
  const offset = animate ? circumference - (score / 100) * circumference : circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-30"
        style={{ background: color }}
      />
      <svg className="w-36 h-36 -rotate-90 relative z-10" viewBox="0 0 100 100">
        {/* Background track */}
        <circle cx="50" cy="50" r="45" fill="none" strokeWidth="6" className="stroke-white/[0.06]" />
        {/* Score arc */}
        <circle
          cx="50" cy="50" r="45" fill="none" strokeWidth="7" strokeLinecap="round"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute z-10 flex flex-col items-center">
        <span className={`text-4xl font-bold ${textColor}`}>{score}</span>
        <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">Score</span>
      </div>
    </div>
  )
}

function RiskBadge({ level }: { level: string }) {
  const styles = {
    high: "bg-red-500/10 text-red-500 border-red-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[level as keyof typeof styles] || styles.low}`}>
      {level}
    </span>
  )
}

export default function ScannerPage() {
  const searchParams = useSearchParams()
  const [text, setText] = useState("")
  const [contentType, setContentType] = useState("website_copy")
  const [scanning, setScanning] = useState(false)
  const [rewriting, setRewriting] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [copiedRewrite, setCopiedRewrite] = useState(false)
  const [scoreAnimated, setScoreAnimated] = useState(false)

  useEffect(() => {
    if (searchParams.get("subscribed") === "true") {
      toast.success("Subscription active! Start scanning.")
    }
  }, [searchParams])

  useEffect(() => {
    const rescanText = sessionStorage.getItem("rescan_text")
    if (rescanText) {
      setText(rescanText)
      sessionStorage.removeItem("rescan_text")
    }
  }, [])

  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => setScoreAnimated(true), 100)
      return () => clearTimeout(timer)
    } else {
      setScoreAnimated(false)
    }
  }, [result])

  async function handleScan() {
    if (!text.trim()) return
    setScanning(true)
    setResult(null)

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, content_type: contentType }),
      })

      if (res.status === 429) {
        toast.error("Daily scan limit reached. Resets at midnight UTC.")
        return
      }
      if (res.status === 403) {
        toast.error("Active subscription required to scan.")
        return
      }
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Scan failed. Please try again.")
        return
      }

      const data = await res.json()
      setResult(data)
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setScanning(false)
    }
  }

  async function handleRewrite() {
    if (!result) return
    setRewriting(true)

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scan_id: result.id }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Rewrite failed.")
        return
      }

      const data = await res.json()
      setResult({ ...result, rewritten_text: data.rewritten_text })
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setRewriting(false)
    }
  }

  function copyToClipboard(text: string, idx?: number) {
    navigator.clipboard.writeText(text)
    if (idx !== undefined) {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    } else {
      setCopiedRewrite(true)
      setTimeout(() => setCopiedRewrite(false), 2000)
    }
  }

  function handleRescan() {
    if (result?.rewritten_text) {
      setText(result.rewritten_text)
      setResult(null)
    }
  }

  const charCount = text.length

  return (
    <div className="p-6 grid gap-6 lg:grid-cols-5">
      {/* Input Panel */}
      <div className="lg:col-span-3 space-y-6">
        <div>
          <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-2">Core Tool</p>
          <h2 className="text-2xl font-bold text-white">Compliance Scanner</h2>
          <p className="text-white/60 mt-1">
            Paste any marketing content to check against current FDA/FTC guidelines.
          </p>
        </div>

        {/* Content Type Pills */}
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map((t) => {
            const Icon = t.icon
            const isActive = contentType === t.value
            return (
              <button
                key={t.value}
                onClick={() => setContentType(t.value)}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-300 border
                  ${isActive
                    ? "bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] border-transparent shadow-[0_4px_20px_rgba(85,224,57,0.3)]"
                    : "bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/[0.06] hover:border-white/15 hover:text-white/80"
                  }
                `}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Textarea */}
        <div className="relative group">
          <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-[#55E039]/0 via-[#55E039]/0 to-[#55E039]/0 group-focus-within:from-[#55E039]/20 group-focus-within:via-[#55E039]/10 group-focus-within:to-[#55E039]/20 transition-all duration-500 blur-[1px]" />
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 5000))}
            placeholder="Paste your website copy, social caption, ad text, email, or any marketing content here..."
            className="relative min-h-[220px] resize-y bg-white/[0.03] border-white/10 rounded-xl text-white/90 placeholder:text-white/30 focus-visible:border-[#55E039]/30 focus-visible:ring-[#55E039]/10 transition-all duration-300"
          />
          <span className={`absolute bottom-3 right-3 text-xs font-medium ${charCount >= 4500 ? "text-red-400" : "text-white/30"}`}>
            {charCount.toLocaleString()}/5,000
          </span>
        </div>

        {/* Scan Button */}
        <button
          onClick={handleScan}
          disabled={scanning || !text.trim()}
          className={`
            w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider
            transition-all duration-300 flex items-center justify-center gap-2
            disabled:opacity-40 disabled:cursor-not-allowed
            ${scanning
              ? "bg-white/[0.03] border border-white/10 text-white/60"
              : "bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:scale-[1.01] active:scale-[0.99]"
            }
          `}
        >
          {scanning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing Content...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              Scan for Compliance Issues
            </>
          )}
        </button>

        <p className="text-xs text-white/30 text-center">
          This tool provides educational guidance only and does not constitute legal or regulatory advice.
        </p>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-2 space-y-4">
        {/* Empty State */}
        {!result && !scanning && (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#55E039]/[0.06] flex items-center justify-center mb-5">
              <Shield className="h-8 w-8 text-[#55E039]/30" />
            </div>
            <p className="text-white/50 font-medium mb-1">Ready to Scan</p>
            <p className="text-white/30 text-sm">Paste your content and hit scan to check compliance.</p>
          </div>
        )}

        {/* Loading State */}
        {scanning && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] flex flex-col items-center justify-center py-16 relative overflow-hidden">
            {/* Pulsing glow background */}
            <div className="absolute inset-0 bg-[#55E039]/[0.02] animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#55E039]/10 rounded-full blur-3xl animate-pulse" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-[#55E039]/20 border-t-[#55E039] animate-spin mb-5" />
              <p className="text-white/70 font-medium">Analyzing content...</p>
              <p className="text-white/30 text-xs mt-1">Checking FDA/FTC compliance rules</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Score Card */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 flex flex-col items-center shadow-[0_0_30px_rgba(85,224,57,0.05)]">
              <ScoreRing score={result.compliance_score} animate={scoreAnimated} />
              <p className="mt-4 text-sm text-center text-white/60 leading-relaxed max-w-xs">
                {result.summary}
              </p>
              <div className="flex gap-3 mt-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-white/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  {result.flag_count} flags
                </span>
                {result.high_risk_count > 0 && (
                  <span className="flex items-center gap-1.5 text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {result.high_risk_count} high
                  </span>
                )}
                {result.medium_risk_count > 0 && (
                  <span className="flex items-center gap-1.5 text-yellow-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    {result.medium_risk_count} med
                  </span>
                )}
                {result.low_risk_count > 0 && (
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {result.low_risk_count} low
                  </span>
                )}
              </div>
            </div>

            {/* Flags */}
            {result.flags.length > 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <h3 className="text-sm font-bold text-white">Flagged Content</h3>
                </div>
                <div className="p-4 space-y-3">
                  {result.flags.map((flag, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3 hover:bg-white/[0.04] transition-colors duration-200"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      {/* Header: matched text + risk */}
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-red-400 bg-red-500/[0.08] rounded-md px-2.5 py-1 border border-red-500/10 font-mono leading-relaxed">
                          &quot;{flag.matched_text}&quot;
                        </p>
                        <RiskBadge level={flag.risk_level} />
                      </div>
                      {/* Reason */}
                      <p className="text-sm text-white/50 leading-relaxed">{flag.reason}</p>
                      {/* Alternative */}
                      <div className="flex items-center gap-2 bg-[#55E039]/[0.06] border border-[#55E039]/10 rounded-lg px-3 py-2.5">
                        <Sparkles className="h-3.5 w-3.5 text-[#55E039] shrink-0" />
                        <p className="text-sm text-[#55E039] flex-1 leading-relaxed">
                          {flag.alternative}
                        </p>
                        <button
                          className="shrink-0 p-1.5 rounded-md hover:bg-[#55E039]/10 transition-colors"
                          onClick={() => copyToClipboard(flag.alternative, i)}
                        >
                          {copiedIdx === i ? (
                            <Check className="h-3.5 w-3.5 text-[#55E039]" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-[#55E039]/60" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-[#55E039]/20 bg-[#55E039]/[0.03] p-8 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#55E039]/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-7 w-7 text-[#55E039]" />
                </div>
                <p className="font-bold text-white">No compliance issues found</p>
                <p className="text-sm text-white/50 mt-1">
                  This content appears safe to publish.
                </p>
                <p className="text-xs text-white/30 mt-3">
                  Always review with qualified healthcare marketing counsel before publishing.
                </p>
              </div>
            )}

            {/* Rewrite Section */}
            {result.flags.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <h3 className="text-sm font-bold text-white">Compliant Rewrite</h3>
                </div>
                <div className="p-4 space-y-3">
                  {!result.rewritten_text ? (
                    <button
                      onClick={handleRewrite}
                      disabled={rewriting}
                      className={`
                        w-full py-3 rounded-lg text-sm font-semibold
                        transition-all duration-300 flex items-center justify-center gap-2
                        border border-[#55E039]/20 bg-[#55E039]/[0.04] text-[#55E039]
                        hover:bg-[#55E039]/[0.08] hover:border-[#55E039]/30
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {rewriting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Rewriting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Rewrite for Compliance
                        </>
                      )}
                    </button>
                  ) : (
                    <>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">Original</p>
                          <p className="text-sm text-white/40 line-through leading-relaxed">{result.flags.map(f => f.matched_text).join(" ... ")}</p>
                        </div>
                        <div className="rounded-lg border border-[#55E039]/20 bg-[#55E039]/[0.04] p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#55E039] mb-2">Rewritten</p>
                          <p className="text-sm text-white/80 leading-relaxed">{result.rewritten_text}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06] transition-all duration-300 flex items-center justify-center gap-2"
                          onClick={() => copyToClipboard(result.rewritten_text!)}
                        >
                          {copiedRewrite ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-[#55E039]" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              Copy Rewritten Text
                            </>
                          )}
                        </button>
                        <button
                          className="py-2.5 px-4 rounded-lg text-sm font-medium border border-[#55E039]/20 bg-[#55E039]/[0.04] text-[#55E039] hover:bg-[#55E039]/[0.08] transition-all duration-300 flex items-center gap-2"
                          onClick={handleRescan}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Re-scan
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
