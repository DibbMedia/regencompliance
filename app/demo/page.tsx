"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Shield, Loader2, Copy, Check, RefreshCw, CheckCircle2, ArrowRight, Lock, Sparkles } from "lucide-react"
import { CheckoutButton } from "@/components/checkout-button"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
  const color = score >= 80 ? "text-green-400" : score >= 50 ? "text-yellow-400" : "text-red-400"
  const bgColor = score >= 80 ? "stroke-green-500" : score >= 50 ? "stroke-yellow-500" : "stroke-red-500"
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
    // Check demo status on load
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
    <div className="min-h-screen bg-[#0B0515] text-slate-100">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0515]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#55E039]">
              <Shield className="h-5 w-5 text-[#0B0515]" />
            </div>
            <span className="text-xl font-bold tracking-tight">RegenCompliance</span>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-[#55E039]/30 text-[#55E039] bg-[#55E039]/5">
              Demo Mode {scansLeft !== null && `— ${scansLeft} scan${scansLeft === 1 ? "" : "s"} left`}
            </Badge>
            <CheckoutButton className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#55E039] px-5 text-sm font-semibold text-[#0B0515] hover:bg-[#4BCC33] transition-colors cursor-pointer">
              Sign Up
              <ArrowRight className="h-3.5 w-3.5" />
            </CheckoutButton>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Demo Expired */}
        {demoExpired && (
          <div className="mb-8 rounded-2xl border-2 border-[#55E039]/20 bg-[#120B1E] p-10 text-center">
            <Lock className="h-12 w-12 text-[#55E039] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Demo Limit Reached</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              You&apos;ve used all your free demo scans. Sign up for unlimited compliance scanning, AI rewrites, and full access to all features.
            </p>
            <CheckoutButton className="inline-flex h-12 items-center gap-2 rounded-full bg-[#55E039] px-8 text-base font-semibold text-[#0B0515] shadow-lg shadow-[#55E039]/20 hover:bg-[#4BCC33] transition-all cursor-pointer">
              Get Full Access — $497/month
              <ArrowRight className="h-4 w-4" />
            </CheckoutButton>
          </div>
        )}

        <div className={`grid gap-6 lg:grid-cols-5 ${demoExpired ? "opacity-40 pointer-events-none" : ""}`}>
          {/* Input Panel */}
          <div className="lg:col-span-3 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Compliance Scanner</h2>
              <p className="text-slate-400">
                Paste any marketing content to check against current FDA/FTC guidelines.
              </p>
            </div>

            <Tabs value={contentType} onValueChange={setContentType}>
              <TabsList className="flex-wrap h-auto bg-white/5">
                {CONTENT_TYPES.map((t) => (
                  <TabsTrigger key={t.value} value={t.value} className="text-xs">
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="relative">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 5000))}
                placeholder="Paste your website copy, social caption, ad text, email, or any marketing content here..."
                className="min-h-[200px] resize-y bg-[#120B1E] border-white/10 text-slate-200 placeholder:text-slate-600"
              />
              <span className={`absolute bottom-2 right-2 text-xs ${charCount >= 4500 ? "text-red-400" : "text-slate-600"}`}>
                {charCount}/5000
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleScan}
                className="flex-1 bg-[#55E039] text-[#0B0515] hover:bg-[#4BCC33] font-semibold"
                disabled={scanning || !text.trim() || demoExpired}
              >
                {scanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Scan for Compliance Issues
                  </>
                )}
              </Button>
              {!text && (
                <Button
                  variant="outline"
                  onClick={loadSample}
                  className="border-white/10 text-slate-300 hover:bg-white/5"
                >
                  Load Sample
                </Button>
              )}
            </div>

            <p className="text-xs text-slate-600 text-center">
              This tool provides educational guidance only and does not constitute legal or regulatory advice.
            </p>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-4">
            {!result && !scanning && (
              <div className="rounded-2xl border border-white/5 bg-[#120B1E] p-12 text-center">
                <Shield className="h-12 w-12 mb-4 opacity-20 mx-auto text-slate-600" />
                <p className="text-slate-500">Results will appear here after scanning.</p>
                {!text && (
                  <button onClick={loadSample} className="mt-3 text-sm text-[#55E039] hover:underline">
                    Try with sample content →
                  </button>
                )}
              </div>
            )}

            {scanning && (
              <div className="rounded-2xl border border-white/5 bg-[#120B1E] p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#55E039] mx-auto mb-4" />
                <p className="text-slate-400">Analyzing content against FDA/FTC rules...</p>
              </div>
            )}

            {result && (
              <>
                {/* Score */}
                <div className="rounded-2xl border border-white/5 bg-[#120B1E] p-6 text-center">
                  <ScoreRing score={result.compliance_score} />
                  <div className="mt-2">
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      result.compliance_score >= 80 ? "text-green-400 bg-green-500/10 border border-green-500/20" :
                      result.compliance_score >= 50 ? "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20" :
                      "text-red-400 bg-red-500/10 border border-red-500/20"
                    }`}>
                      {result.compliance_score >= 80 ? "Low Risk" : result.compliance_score >= 50 ? "Medium Risk" : "High Risk — Do Not Publish"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{result.summary}</p>
                  <div className="flex justify-center gap-4 mt-4 text-sm">
                    <span className="text-slate-500">{result.flag_count} flags</span>
                    <span className="text-red-400">{result.high_risk_count} high</span>
                    <span className="text-yellow-400">{result.medium_risk_count} medium</span>
                    <span className="text-blue-400">{result.low_risk_count} low</span>
                  </div>
                  {result.compliance_score < 80 && (
                    <p className="mt-4 text-xs text-slate-500 border-t border-white/5 pt-4">
                      {result.compliance_score < 50
                        ? "This content contains multiple high-risk violations that could trigger an FDA warning letter or FTC enforcement action. Do not publish without rewriting."
                        : "This content has compliance issues that should be addressed before publishing. Use the rewrite tool below to fix flagged phrases."}
                    </p>
                  )}
                </div>

                {/* Flags */}
                {result.flags.length > 0 ? (
                  <div className="rounded-2xl border border-white/5 bg-[#120B1E] p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white text-sm">Flagged Content</h3>
                      <span className="text-[10px] text-slate-500">{result.flags.length} violation{result.flags.length !== 1 ? "s" : ""} found</span>
                    </div>
                    {result.flags.map((flag, i) => (
                      <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-2">
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
                        <p className="text-xs text-slate-400">{flag.reason}</p>
                        <div className="bg-[#55E039]/5 border border-[#55E039]/10 rounded-md p-2">
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
                                <Copy className="h-3 w-3 text-slate-500" />
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
                    <p className="text-sm text-slate-400 mt-1">This content appears safe to publish.</p>
                  </div>
                )}

                {/* Rewrite */}
                {result.flags.length > 0 && (
                  <div className="rounded-2xl border border-white/5 bg-[#120B1E] p-5 space-y-3">
                    <h3 className="font-semibold text-white text-sm">Compliant Rewrite</h3>
                    {!result.rewritten_text ? (
                      <Button
                        onClick={handleRewrite}
                        variant="outline"
                        className="w-full border-[#55E039]/20 text-[#55E039] hover:bg-[#55E039]/5"
                        disabled={rewriting}
                      >
                        {rewriting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Rewriting...
                          </>
                        ) : (
                          "Rewrite for Compliance"
                        )}
                      </Button>
                    ) : (
                      <>
                        <div className="rounded-lg border border-[#55E039]/10 bg-[#55E039]/5 p-4">
                          <p className="text-xs font-medium text-[#55E039] mb-2">Compliant Version</p>
                          <p className="text-sm text-slate-300 leading-relaxed">{result.rewritten_text}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-white/10 text-slate-300 hover:bg-white/5"
                          onClick={() => copyToClipboard(result.rewritten_text!)}
                        >
                          {copiedRewrite ? (
                            <><Check className="mr-1 h-3 w-3" /> Copied</>
                          ) : (
                            <><Copy className="mr-1 h-3 w-3" /> Copy Rewritten Text</>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {/* CTA */}
                <div className="rounded-2xl border border-[#55E039]/20 bg-gradient-to-b from-[#55E039]/5 to-transparent p-5 text-center">
                  <p className="text-sm text-slate-400 mb-3">
                    {scansLeft !== null && scansLeft > 0
                      ? `${scansLeft} free scan${scansLeft === 1 ? "" : "s"} remaining`
                      : "Want unlimited scans + full features?"}
                  </p>
                  <CheckoutButton className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#55E039] px-6 text-sm font-semibold text-[#0B0515] hover:bg-[#4BCC33] transition-colors cursor-pointer">
                    Get Full Access
                    <ArrowRight className="h-3.5 w-3.5" />
                  </CheckoutButton>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
