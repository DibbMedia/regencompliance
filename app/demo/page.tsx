"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Shield, Loader2, Copy, Check, RefreshCw, CheckCircle2, ArrowRight, Lock, Sparkles, Upload } from "lucide-react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import type { ScanFlag } from "@/lib/types"

const CONTENT_TYPES = [
  { value: "website_copy", label: "Website Copy" },
  { value: "social_post", label: "Social Post" },
  { value: "ad_copy", label: "Ad Copy" },
  { value: "email", label: "Email" },
  { value: "script", label: "Script" },
  { value: "other", label: "Other" },
]

const SAMPLE_TEXT = `Our cutting-edge stem cell therapy cures arthritis and heals damaged joints permanently. FDA-approved stem cells are injected directly into the affected area, eliminating chronic pain forever. This breakthrough treatment reverses aging and repairs tissue with guaranteed results and no side effects. Thousands of patients have been cured of their conditions through our proven regenerative medicine protocols.`

interface DemoResult {
  compliance_score: number
  summary: string
  flags: ScanFlag[]
  flag_count: number
  high_risk_count: number
  medium_risk_count: number
  low_risk_count: number
  rewritten_text?: string | null
}

interface DemoStatus {
  scans_used: number
  max_scans: number
  expired: boolean
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "text-[#55E039]" : score >= 50 ? "text-yellow-500" : "text-red-500"
  const bgColor = score >= 80 ? "stroke-[#55E039]" : score >= 50 ? "stroke-yellow-500" : "stroke-red-500"
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
        <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" strokeLinecap="round"
          className={bgColor} strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <span className={`absolute text-3xl font-bold ${color}`}>{score}</span>
    </div>
  )
}

export default function DemoPage() {
  const [text, setText] = useState("")
  const [contentType, setContentType] = useState("website_copy")
  const [scanning, setScanning] = useState(false)
  const [rewriting, setRewriting] = useState(false)
  const [result, setResult] = useState<DemoResult | null>(null)
  const [demoStatus, setDemoStatus] = useState<DemoStatus | null>(null)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [copiedRewrite, setCopiedRewrite] = useState(false)

  useEffect(() => {
    fetch("/api/demo/status").then(r => r.json()).then(setDemoStatus)
  }, [])

  function loadSample() {
    setText(SAMPLE_TEXT)
  }

  async function handleScan() {
    if (!text.trim()) return
    setScanning(true)
    setResult(null)

    try {
      const res = await fetch("/api/demo/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, content_type: contentType }),
      })

      if (res.status === 429) {
        const data = await res.json()
        setDemoStatus(data.demo_status)
        toast.error("Demo limit reached. Sign up for unlimited scans!")
        return
      }

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Scan failed. Please try again.")
        return
      }

      const data = await res.json()
      setResult(data.result)
      setDemoStatus(data.demo_status)
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
      const res = await fetch("/api/demo/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ original_text: text, flags: result.flags }),
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

  const charCount = text.length
  const demoExpired = demoStatus?.expired ?? false
  const scansLeft = demoStatus ? demoStatus.max_scans - demoStatus.scans_used : null

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <MarketingBg />
      <MarketingHeader />

      {/* Demo Mode badge */}
      <div className="relative pt-20 pb-2">
        <div className="mx-auto max-w-6xl px-6 flex justify-center">
          <Badge variant="outline" className="border-[#55E039]/30 text-[#55E039] bg-[#55E039]/5 text-sm px-4 py-1.5">
            Demo Mode {scansLeft !== null && `— ${scansLeft} scan${scansLeft === 1 ? "" : "s"} left`}
          </Badge>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pt-8 pb-16">
        {/* Demo Expired */}
        {demoExpired && (
          <div className="mb-8 rounded-2xl bg-[#111111] border border-[#55E039]/20 p-10 text-center">
            <Lock className="h-12 w-12 text-[#55E039] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Demo Limit Reached</h2>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              You&apos;ve used all your free demo scans. Join the pre-release waitlist to get unlimited compliance scanning, AI rewrites, and full access when your invite is ready.
            </p>
            <Link href="/waitlist" className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-8 text-base font-semibold text-[#0a0a0a] shadow-lg shadow-[#55E039]/25 hover:shadow-xl hover:shadow-[#55E039]/40 hover:brightness-110 transition-all cursor-pointer">
              Join the Waitlist
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-5 ${demoExpired ? "opacity-40 pointer-events-none" : ""}`}>
          {/* Input Panel */}
          <div className="md:col-span-1 lg:col-span-3 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Compliance Scanner</h2>
              <p className="text-white/60">
                Paste any marketing content to check against current FDA/FTC guidelines.
              </p>
            </div>

            {/* Content type pills */}
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setContentType(t.value)}
                  className={`rounded-full px-4 py-2 text-xs font-medium min-h-[40px] transition-all duration-300 ${
                    contentType === t.value
                      ? "bg-[#55E039]/15 border border-[#55E039]/30 text-[#55E039]"
                      : "bg-[#111111] border border-white/15 text-white/60 hover:bg-[#1a1a1a] hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 5000))}
                placeholder="Paste your website copy, social caption, ad text, email, or any marketing content here..."
                className="w-full min-h-[200px] resize-y rounded-2xl bg-[#111111] border border-white/15 text-white placeholder:text-white/40 px-5 py-4 text-sm focus:outline-none focus:border-[#55E039]/40 focus:bg-[#131313] transition-colors"
              />
              <span className={`absolute bottom-3 right-3 text-xs ${charCount >= 4500 ? "text-red-400" : "text-white/30"}`}>
                {charCount}/5000
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleScan}
                className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] font-semibold shadow-lg shadow-[#55E039]/25 hover:shadow-xl hover:shadow-[#55E039]/40 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={scanning || !text.trim() || demoExpired}
              >
                {scanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Scan for Compliance Issues
                  </>
                )}
              </button>
              {!text && (
                <button
                  onClick={loadSample}
                  className="inline-flex h-12 items-center rounded-xl border border-[#55E039]/30 px-6 text-sm font-medium text-[#55E039] hover:bg-[#55E039]/5 transition-all shadow-[0_0_20px_rgba(85,224,57,0.08)]"
                >
                  Load Sample
                </button>
              )}
            </div>

            {/* File Upload Teaser */}
            <div className="rounded-xl border border-dashed border-white/15 bg-[#111111]/80 p-6 text-center">
              <Upload className="h-6 w-6 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/50 font-medium mb-1">File Scanning</p>
              <p className="text-xs text-white/30 mb-3">
                Upload .docx, .pdf, or .txt files for compliance scanning.
              </p>
              <Link href="/waitlist" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/[0.04] border border-[#55E039]/20 px-4 text-xs font-medium text-[#55E039] hover:bg-[#55E039]/5 transition-all cursor-pointer">
                Join the waitlist
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <p className="text-xs text-white/40 text-center">
              This tool provides educational guidance only and does not constitute legal or regulatory advice.
            </p>
          </div>

          {/* Results Panel */}
          <div className="md:col-span-1 lg:col-span-2 space-y-4">
            {!result && !scanning && (
              <div className="rounded-2xl bg-[#111111] border border-white/15 p-12 text-center">
                <Shield className="h-12 w-12 mb-4 opacity-20 mx-auto text-white/40" />
                <p className="text-white/40">Results will appear here after scanning.</p>
                {!text && (
                  <button onClick={loadSample} className="mt-3 text-sm text-[#55E039] hover:underline">
                    Try with sample content
                  </button>
                )}
              </div>
            )}

            {scanning && (
              <div className="rounded-2xl bg-[#111111] border border-white/15 p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#55E039] mx-auto mb-4" />
                <p className="text-white/60">Analyzing content against FDA/FTC rules...</p>
              </div>
            )}

            {result && (
              <>
                {/* Score */}
                <div className="rounded-2xl bg-[#111111] border border-white/15 p-7 text-center">
                  <ScoreRing score={result.compliance_score} />
                  <div className="mt-2">
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      result.compliance_score >= 80 ? "text-[#55E039] bg-[#55E039]/10 border border-[#55E039]/20" :
                      result.compliance_score >= 50 ? "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20" :
                      "text-red-400 bg-red-500/10 border border-red-500/20"
                    }`}>
                      {result.compliance_score >= 80 ? "Low Risk" : result.compliance_score >= 50 ? "Medium Risk" : "High Risk — Do Not Publish"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-white/70">{result.summary}</p>
                  <div className="flex justify-center gap-4 mt-4 text-sm">
                    <span className="text-white/40">{result.flag_count} flags</span>
                    <span className="text-red-400">{result.high_risk_count} high</span>
                    <span className="text-yellow-400">{result.medium_risk_count} medium</span>
                    <span className="text-blue-400">{result.low_risk_count} low</span>
                  </div>
                  {result.compliance_score < 80 && (
                    <p className="mt-4 text-xs text-white/40 pt-4">
                      {result.compliance_score < 50
                        ? "This content contains multiple high-risk violations that could trigger an FDA warning letter or FTC enforcement action. Do not publish without rewriting."
                        : "This content has compliance issues that should be addressed before publishing. Use the rewrite tool below to fix flagged phrases."}
                    </p>
                  )}
                </div>

                {/* Flags */}
                {result.flags.length > 0 ? (
                  <div className="rounded-2xl bg-[#111111] border border-white/15 p-7 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white text-sm">Flagged Content</h3>
                      <span className="text-[10px] text-white/40">{result.flags.length} violation{result.flags.length !== 1 ? "s" : ""} found</span>
                    </div>
                    {result.flags.map((flag, i) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-[#0e0e0e] p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <code className="text-xs text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                            &quot;{flag.matched_text}&quot;
                          </code>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            flag.risk_level === "high" ? "text-red-400 bg-red-500/10" :
                            flag.risk_level === "medium" ? "text-yellow-400 bg-yellow-500/10" :
                            "text-blue-400 bg-blue-500/10"
                          }`}>{flag.risk_level}</span>
                        </div>
                        <p className="text-xs text-white/60">{flag.reason}</p>
                        <div className="bg-[#55E039]/5 border border-[#55E039]/10 rounded-lg p-2">
                          <p className="text-[10px] text-[#55E039]/50 uppercase tracking-wider font-semibold mb-1">Compliant Alternative</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-[#55E039] flex-1">{flag.alternative}</p>
                            <button
                              className="shrink-0 p-1 hover:bg-white/5 rounded"
                              onClick={() => copyToClipboard(flag.alternative, i)}
                            >
                              {copiedIdx === i ? (
                                <Check className="h-3 w-3 text-[#55E039]" />
                              ) : (
                                <Copy className="h-3 w-3 text-white/40" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#55E039]/20 bg-[#55E039]/5 p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-[#55E039] mx-auto mb-3" />
                    <p className="font-medium text-white">No compliance issues found.</p>
                    <p className="text-sm text-white/60 mt-1">This content appears safe to publish.</p>
                  </div>
                )}

                {/* Rewrite */}
                {result.flags.length > 0 && (
                  <div className="rounded-2xl bg-[#111111] border border-white/15 p-7 space-y-3">
                    <h3 className="font-semibold text-white text-sm">Compliant Rewrite</h3>
                    {!result.rewritten_text ? (
                      <button
                        onClick={handleRewrite}
                        className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#55E039]/30 text-[#55E039] font-medium hover:bg-[#55E039]/5 transition-all shadow-[0_0_20px_rgba(85,224,57,0.08)] disabled:opacity-50"
                        disabled={rewriting}
                      >
                        {rewriting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Rewriting...
                          </>
                        ) : (
                          "Rewrite for Compliance"
                        )}
                      </button>
                    ) : (
                      <>
                        <div className="rounded-xl border border-[#55E039]/10 bg-[#55E039]/5 p-4">
                          <p className="text-xs font-medium text-[#55E039] mb-2">Compliant Version</p>
                          <p className="text-sm text-white/70 leading-relaxed">{result.rewritten_text}</p>
                        </div>
                        <button
                          className="w-full inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#111111] border border-white/15 text-sm text-white/70 hover:bg-[#1a1a1a] transition-all"
                          onClick={() => copyToClipboard(result.rewritten_text!)}
                        >
                          {copiedRewrite ? (
                            <><Check className="h-3 w-3" /> Copied</>
                          ) : (
                            <><Copy className="h-3 w-3" /> Copy Rewritten Text</>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* CTA */}
                <div className="rounded-2xl bg-white/[0.03] border border-[#55E039]/20 p-7 text-center">
                  <p className="text-sm text-white/60 mb-3">
                    {scansLeft !== null && scansLeft > 0
                      ? `${scansLeft} free scan${scansLeft === 1 ? "" : "s"} remaining`
                      : "Want unlimited scans + full features?"}
                  </p>
                  <Link href="/waitlist" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-6 text-sm font-semibold text-[#0a0a0a] shadow-lg shadow-[#55E039]/25 hover:shadow-xl hover:shadow-[#55E039]/40 hover:brightness-110 transition-all cursor-pointer">
                    Join the Waitlist
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  )
}
