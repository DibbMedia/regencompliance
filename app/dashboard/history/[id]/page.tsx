"use client"

import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowLeft, Download, RefreshCw, Copy, Check, ChevronDown, ChevronUp, Shield, Sparkles, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Scan, ScanFlag } from "@/lib/types"
import Link from "next/link"
import { ScoreExplainer } from "@/components/score-explainer"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#55E039" : score >= 50 ? "#eab308" : "#ef4444"
  const textColor = score >= 80 ? "text-[#55E039]" : score >= 50 ? "text-yellow-500" : "text-red-500"
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-20"
        style={{ background: color }}
      />
      <svg className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 -rotate-90 relative z-10" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" strokeWidth="6" className="stroke-white/[0.06]" />
        <circle
          cx="50" cy="50" r="45" fill="none" strokeWidth="7" strokeLinecap="round"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute z-10 flex flex-col items-center">
        <span className={`text-3xl font-bold ${textColor}`}>{score}</span>
        <span className="text-[9px] font-medium text-white/40 uppercase tracking-widest">Score</span>
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

function FlagCard({ flag, index }: { flag: ScanFlag; index: number }) {
  const [expanded, setExpanded] = useState(true)
  const [copied, setCopied] = useState(false)

  function copyAlt() {
    navigator.clipboard.writeText(flag.alternative)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:bg-white/[0.04] transition-all duration-200">
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-bold text-white/40">
            {index + 1}
          </span>
          <p className="text-sm font-medium text-red-400 truncate">
            &quot;{flag.matched_text}&quot;
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <RiskBadge level={flag.risk_level} />
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-white/30" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/30" />
          )}
        </div>
      </button>

      {/* Expandable content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/[0.04] pt-3">
          <p className="text-sm text-white/50 leading-relaxed">{flag.reason}</p>
          <div className="flex items-center gap-2 bg-[#55E039]/[0.06] border border-[#55E039]/10 rounded-lg px-3 py-2.5">
            <Sparkles className="h-3.5 w-3.5 text-[#55E039] shrink-0" />
            <p className="text-sm text-[#55E039] flex-1 leading-relaxed">
              {flag.alternative}
            </p>
            <button
              className="shrink-0 p-1.5 rounded-md hover:bg-[#55E039]/10 transition-colors"
              onClick={(e) => { e.stopPropagation(); copyAlt() }}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-[#55E039]" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-[#55E039]/60" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ScanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const { data: scan, isLoading } = useSWR<Scan>(`/api/scans/${id}`, fetcher)

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-3xl">
        <div className="h-8 w-24 rounded-lg bg-white/[0.06] animate-pulse" />
        <div className="h-48 w-full rounded-xl bg-white/[0.03] animate-pulse" />
        <div className="h-32 w-full rounded-xl bg-white/[0.03] animate-pulse" />
      </div>
    )
  }

  if (!scan) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-5">
          <AlertTriangle className="h-8 w-8 text-white/20" />
        </div>
        <p className="text-white/50 font-medium">Scan not found</p>
        <p className="text-white/30 text-sm mt-1">This scan may have been deleted.</p>
      </div>
    )
  }

  const flags = (scan.flags || []) as ScanFlag[]
  const score = scan.compliance_score ?? 0

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Back Navigation */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to History
      </button>

      {/* Header Card */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_30px_rgba(85,224,57,0.05)]">
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
          <div className="flex flex-col items-center gap-1">
            <ScoreRing score={score} />
            <ScoreExplainer score={score} />
          </div>
          <div className="flex-1 min-w-0 sm:min-w-[200px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10 bg-white/[0.04] text-white/50">
                {scan.content_type.replace("_", " ")}
              </span>
              {scan.scan_duration_ms && (
                <span className="text-[10px] text-white/25 font-medium">{scan.scan_duration_ms}ms</span>
              )}
            </div>
            <p className="text-sm text-white/70">
              {new Date(scan.created_at).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              {" at "}
              {new Date(scan.created_at).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
            {flags.length > 0 && (
              <div className="flex gap-3 mt-2 text-xs font-medium">
                <span className="text-white/40">{flags.length} flag{flags.length !== 1 ? "s" : ""}</span>
                {flags.filter(f => f.risk_level === "high").length > 0 && (
                  <span className="text-red-400">{flags.filter(f => f.risk_level === "high").length} high</span>
                )}
                {flags.filter(f => f.risk_level === "medium").length > 0 && (
                  <span className="text-yellow-400">{flags.filter(f => f.risk_level === "medium").length} medium</span>
                )}
                {flags.filter(f => f.risk_level === "low").length > 0 && (
                  <span className="text-blue-400">{flags.filter(f => f.risk_level === "low").length} low</span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
            <a
              href={`/api/scans/${id}/export`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] text-sm font-bold shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] transition-all duration-300"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </a>
            <Link
              href="/dashboard/scanner"
              onClick={() => {
                if (typeof window !== "undefined") {
                  sessionStorage.setItem("rescan_text", scan.original_text)
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#55E039]/20 bg-[#55E039]/[0.04] text-[#55E039] text-sm font-medium hover:bg-[#55E039]/[0.08] hover:border-[#55E039]/30 transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4" />
              Re-scan
            </Link>
          </div>
        </div>
      </div>

      {/* Original Text */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
          <h3 className="text-sm font-bold text-white">Original Content</h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-white/60 whitespace-pre-wrap leading-relaxed">{scan.original_text}</p>
        </div>
      </div>

      {/* Flags */}
      {flags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em]">Flagged Content</p>
            <span className="text-xs text-white/30">({flags.length})</span>
          </div>
          <div className="space-y-2">
            {flags.map((flag, i) => (
              <FlagCard key={i} flag={flag} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* No Flags */}
      {flags.length === 0 && (
        <div className="rounded-xl border border-[#55E039]/20 bg-[#55E039]/[0.03] p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-[#55E039]/10 flex items-center justify-center mb-4">
            <Shield className="h-7 w-7 text-[#55E039]" />
          </div>
          <p className="font-bold text-white">No compliance issues found</p>
          <p className="text-sm text-white/50 mt-1">This content appeared safe to publish at the time of scanning.</p>
        </div>
      )}

      {/* Rewrite */}
      {scan.rewritten_text && (
        <div className="rounded-xl border border-[#55E039]/20 bg-[#55E039]/[0.03] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#55E039]/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#55E039]" />
              <h3 className="text-sm font-bold text-white">Compliant Rewrite</h3>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(scan.rewritten_text!)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#55E039]/20 bg-[#55E039]/[0.04] text-[#55E039] text-xs font-medium hover:bg-[#55E039]/[0.08] transition-all duration-300"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="p-4">
            <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{scan.rewritten_text}</p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-white/30 italic text-center">
        This tool provides educational compliance guidance only. It is not legal advice and does not guarantee regulatory compliance. Always consult qualified healthcare marketing counsel.
      </p>
    </div>
  )
}
