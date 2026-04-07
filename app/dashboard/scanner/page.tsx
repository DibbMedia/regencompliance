"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Shield, Loader2, Copy, Check, RefreshCw, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import type { ScanFlag } from "@/lib/types"

const CONTENT_TYPES = [
  { value: "website_copy", label: "Website Copy" },
  { value: "social_post", label: "Social Post" },
  { value: "ad_copy", label: "Ad Copy" },
  { value: "email", label: "Email" },
  { value: "script", label: "Script" },
  { value: "other", label: "Other" },
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

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "text-[#55E039]" : score >= 50 ? "text-yellow-500" : "text-red-500"
  const bgColor = score >= 80 ? "stroke-[#55E039]" : score >= 50 ? "stroke-yellow-500" : "stroke-red-500"
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
        <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" strokeLinecap="round"
          className={bgColor} strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <span className={`absolute text-3xl font-bold ${color}`}>{score}</span>
    </div>
  )
}

function RiskBadge({ level }: { level: string }) {
  const variant = level === "high" ? "destructive" : level === "medium" ? "secondary" : "outline"
  return <Badge variant={variant} className="text-xs uppercase">{level}</Badge>
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

  useEffect(() => {
    if (searchParams.get("subscribed") === "true") {
      toast.success("Subscription active! Start scanning.")
    }
  }, [searchParams])

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
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Input Panel */}
      <div className="lg:col-span-3 space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Compliance Scanner</h2>
          <p className="text-muted-foreground">
            Paste any marketing content to check against current FDA/FTC guidelines.
          </p>
        </div>

        <Tabs value={contentType} onValueChange={setContentType}>
          <TabsList className="flex-wrap h-auto">
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
            className="min-h-[200px] resize-y"
          />
          <span className={`absolute bottom-2 right-2 text-xs ${charCount >= 4500 ? "text-red-500" : "text-muted-foreground"}`}>
            {charCount}/5000
          </span>
        </div>

        <Button
          onClick={handleScan}
          className="w-full"
          disabled={scanning || !text.trim()}
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

        <p className="text-xs text-muted-foreground text-center">
          This tool provides educational guidance only and does not constitute legal or regulatory advice.
        </p>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-2 space-y-4">
        {!result && !scanning && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mb-4 opacity-20" />
              <p>Results will appear here after scanning.</p>
            </CardContent>
          </Card>
        )}

        {scanning && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#55E039] mb-4" />
              <p className="text-muted-foreground">Analyzing content...</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <>
            {/* Score */}
            <Card className="shadow-[0_0_30px_rgba(85,224,57,0.05)]">
              <CardContent className="flex flex-col items-center py-6">
                <ScoreRing score={result.compliance_score} />
                <p className="mt-3 text-sm text-center text-muted-foreground">
                  {result.summary}
                </p>
                <div className="flex gap-4 mt-4 text-sm">
                  <span>{result.flag_count} flags</span>
                  <span className="text-red-500">{result.high_risk_count} high</span>
                  <span className="text-yellow-500">{result.medium_risk_count} medium</span>
                  <span className="text-blue-500">{result.low_risk_count} low</span>
                </div>
              </CardContent>
            </Card>

            {/* Flags */}
            {result.flags.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Flagged Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.flags.map((flag, i) => (
                    <div key={i} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-xs font-mono">
                          &quot;{flag.matched_text}&quot;
                        </Badge>
                        <RiskBadge level={flag.risk_level} />
                      </div>
                      <p className="text-sm text-muted-foreground">{flag.reason}</p>
                      <div className="flex items-center gap-2 bg-[#55E039]/10 rounded-md p-2">
                        <p className="text-sm text-[#55E039] flex-1">
                          {flag.alternative}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => copyToClipboard(flag.alternative, i)}
                        >
                          {copiedIdx === i ? (
                            <Check className="h-3 w-3 text-[#55E039]" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-[#55E039] mb-3" />
                  <p className="font-medium">No compliance issues found.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This content appears safe to publish.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Always review with qualified healthcare marketing counsel before publishing.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Rewrite */}
            {result.flags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Compliant Rewrite</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!result.rewritten_text ? (
                    <Button
                      onClick={handleRewrite}
                      variant="outline"
                      className="w-full"
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
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-md border p-3">
                          <p className="text-xs font-medium mb-1 text-muted-foreground">Original</p>
                          <p className="text-sm line-through opacity-60">{result.flags.map(f => f.matched_text).join(" ... ")}</p>
                        </div>
                        <div className="rounded-md border border-[#55E039]/30 bg-[#55E039]/5 p-3">
                          <p className="text-xs font-medium mb-1 text-[#55E039]">Rewritten</p>
                          <p className="text-sm">{result.rewritten_text}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => copyToClipboard(result.rewritten_text!)}
                        >
                          {copiedRewrite ? (
                            <>
                              <Check className="mr-1 h-3 w-3" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1 h-3 w-3" />
                              Copy Rewritten Text
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRescan}
                        >
                          <RefreshCw className="mr-1 h-3 w-3" />
                          Re-scan
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
