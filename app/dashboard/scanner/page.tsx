"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Shield, Loader2, Copy, Check, RefreshCw, CheckCircle2, Sparkles, FileText, Share2, Megaphone, Mail, Clapperboard, MoreHorizontal, Globe, Link2, Upload, X, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { HelpTooltip } from "@/components/ui/help-tooltip"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ScanFlag } from "@/lib/types"
import { ScoreExplainer } from "@/components/score-explainer"
import { buildTextFragmentUrl } from "@/lib/text-fragment"

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
  page_title?: string | null
  source_url?: string | null
}

type ScanMode = "paste" | "url" | "file"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function renderContextWithHighlight(context: string, match: string) {
  if (!match) return context
  const idx = context.toLowerCase().indexOf(match.toLowerCase())
  if (idx === -1) return context
  const before = context.slice(0, idx)
  const hit = context.slice(idx, idx + match.length)
  const after = context.slice(idx + match.length)
  return (
    <>
      {before}
      <span className="font-semibold text-red-300 bg-red-500/[0.12] rounded px-0.5">{hit}</span>
      {after}
    </>
  )
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
      <svg className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 -rotate-90 relative z-10" viewBox="0 0 100 100">
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
  const [scanMode, setScanMode] = useState<ScanMode>("paste")
  const [text, setText] = useState("")
  const [url, setUrl] = useState("")
  const [contentType, setContentType] = useState("website_copy")
  const [scanning, setScanning] = useState(false)
  const [rewriting, setRewriting] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [copiedRewrite, setCopiedRewrite] = useState(false)
  const [scoreAnimated, setScoreAnimated] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  async function handleUrlScan() {
    if (!url.trim()) return
    setScanning(true)
    setResult(null)

    try {
      // Normalize URL - add https:// if no protocol
      let scanUrl = url.trim()
      if (!/^https?:\/\//i.test(scanUrl)) {
        scanUrl = `https://${scanUrl}`
      }

      const res = await fetch("/api/scan-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scanUrl, content_type: "website_copy" }),
      })

      if (res.status === 429) {
        toast.error("Rate limit reached. Please try again later.")
        return
      }
      if (res.status === 403) {
        toast.error("Active subscription required to scan.")
        return
      }
      if (res.status === 422) {
        const data = await res.json()
        toast.error(data.error || "Could not extract content from this URL.")
        return
      }
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "URL scan failed. Please try again.")
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

  async function handleFileScan() {
    if (!file) return
    setScanning(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("content_type", contentType)

      const res = await fetch("/api/scan-file", {
        method: "POST",
        body: formData,
      })

      if (res.status === 429) {
        toast.error("Rate limit reached. Please try again later.")
        return
      }
      if (res.status === 403) {
        toast.error("Active subscription required to scan.")
        return
      }
      if (res.status === 422) {
        const data = await res.json()
        toast.error(data.error || "Could not extract text from this file.")
        return
      }
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "File scan failed. Please try again.")
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

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setResult(null)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) {
      const ext = dropped.name.toLowerCase()
      if (ext.endsWith(".txt") || ext.endsWith(".pdf") || ext.endsWith(".docx")) {
        setFile(dropped)
        setResult(null)
      } else {
        toast.error("Unsupported file type. Please upload a .txt, .pdf, or .docx file.")
      }
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }, [])

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
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Input Panel */}
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-2">Core Tool</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white inline-flex items-center gap-2">
            Compliance Scanner
            <HelpTooltip text="Paste any marketing content to check it against FDA/FTC compliance rules. Results are educational guidance, not legal advice." />
          </h1>
          <p className="text-white/60 mt-1">
            Check content against FDA/FTC guidelines. Paste text, scan a URL, or upload a file.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]" role="tablist" aria-label="Scan input mode">
          <button
            role="tab"
            aria-selected={scanMode === "paste"}
            onClick={() => { setScanMode("paste"); setResult(null) }}
            className={`
              flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium
              transition-all duration-300
              ${scanMode === "paste"
                ? "bg-[#55E039]/10 text-[#55E039] border-b-2 border-[#55E039]"
                : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
              }
            `}
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span className="sm:hidden">Paste</span>
            <span className="hidden sm:inline">Paste Content</span>
          </button>
          <button
            role="tab"
            aria-selected={scanMode === "url"}
            onClick={() => { setScanMode("url"); setResult(null) }}
            className={`
              flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium
              transition-all duration-300 border-l border-white/10
              ${scanMode === "url"
                ? "bg-[#55E039]/10 text-[#55E039] border-b-2 border-[#55E039]"
                : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
              }
            `}
          >
            <Globe className="h-4 w-4 shrink-0" />
            <span className="sm:hidden">URL</span>
            <span className="hidden sm:inline">Scan URL</span>
          </button>
          <button
            role="tab"
            aria-selected={scanMode === "file"}
            onClick={() => { setScanMode("file"); setResult(null) }}
            className={`
              flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium
              transition-all duration-300 border-l border-white/10
              ${scanMode === "file"
                ? "bg-[#55E039]/10 text-[#55E039] border-b-2 border-[#55E039]"
                : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
              }
            `}
          >
            <Upload className="h-4 w-4 shrink-0" />
            <span className="sm:hidden">File</span>
            <span className="hidden sm:inline">Upload File</span>
          </button>
        </div>

        {scanMode === "file" ? (
          <>
            {/* Content Type Pills */}
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Content type">
              {CONTENT_TYPES.map((t) => {
                const Icon = t.icon
                const isActive = contentType === t.value
                return (
                  <button
                    key={t.value}
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setContentType(t.value)}
                    className={`
                      inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm font-medium
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

            {/* Drop Zone */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".docx,.pdf,.txt"
              onChange={handleFileSelect}
            />

            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  rounded-xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer
                  transition-all duration-300
                  ${dragging
                    ? "border-[#55E039]/40 bg-[#55E039]/[0.04]"
                    : "border-white/10 bg-white/[0.02] hover:border-[#55E039]/20 hover:bg-[#55E039]/[0.02]"
                  }
                `}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${dragging ? "bg-[#55E039]/10" : "bg-white/[0.04]"}`}>
                    <Upload className={`h-7 w-7 transition-colors duration-300 ${dragging ? "text-[#55E039]" : "text-white/30"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/70">
                      <span className="hidden sm:inline">Drop your file here or </span>
                      <span className="text-[#55E039] hover:text-[#55E039]/80">click to browse</span>
                    </p>
                    <p className="text-xs text-white/30 mt-1">.docx, .pdf, or .txt — max 10MB</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-[#55E039]/20 bg-[#55E039]/[0.04] p-4 flex items-center gap-3">
                <FileText className="h-8 w-8 text-[#55E039] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{file.name}</p>
                  <p className="text-xs text-white/40">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = "" }}
                  aria-label="Remove file"
                  className="ml-auto shrink-0 p-2.5 sm:p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Scan File Button */}
            <button
              onClick={handleFileScan}
              disabled={scanning || !file}
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
                  Extracting &amp; Analyzing File...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Scan File
                </>
              )}
            </button>
          </>
        ) : scanMode === "paste" ? (
          <>
            {/* Content Type Pills */}
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Content type">
              {CONTENT_TYPES.map((t) => {
                const Icon = t.icon
                const isActive = contentType === t.value
                return (
                  <button
                    key={t.value}
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setContentType(t.value)}
                    className={`
                      inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm font-medium
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
                className="relative min-h-[140px] sm:min-h-[220px] resize-y bg-white/[0.03] border-white/10 rounded-xl text-white/90 placeholder:text-white/30 focus-visible:border-[#55E039]/30 focus-visible:ring-[#55E039]/10 transition-all duration-300"
              />
              <span aria-live="polite" className={`absolute bottom-3 right-3 text-xs font-medium ${charCount >= 4500 ? "text-red-400" : "text-white/30"}`}>
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
          </>
        ) : (
          <>
            {/* URL Input */}
            <div className="relative group">
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-[#55E039]/0 via-[#55E039]/0 to-[#55E039]/0 group-focus-within:from-[#55E039]/20 group-focus-within:via-[#55E039]/10 group-focus-within:to-[#55E039]/20 transition-all duration-500 blur-[1px]" />
              <div className="relative flex items-center">
                <Link2 className="absolute left-4 h-4 w-4 text-white/30 z-10" />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourclinic.com/services/stem-cell-therapy"
                  onKeyDown={(e) => { if (e.key === "Enter" && url.trim()) handleUrlScan() }}
                  className="pl-11 py-5 sm:py-6 bg-white/[0.03] border-white/10 rounded-xl text-white/90 placeholder:text-white/30 focus-visible:border-[#55E039]/30 focus-visible:ring-[#55E039]/10 transition-all duration-300 text-base"
                />
              </div>
            </div>

            <p className="text-sm text-white/40">
              Scans this exact page only — not the full site.
            </p>

            {/* Scan URL Button */}
            <button
              onClick={handleUrlScan}
              disabled={scanning || !url.trim()}
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
                  Fetching &amp; Analyzing Page...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  Scan URL
                </>
              )}
            </button>
          </>
        )}

        <p className="text-xs text-white/30 italic text-center">
          Educational guidance only — not legal advice. Consult healthcare marketing counsel before publishing.
        </p>
      </div>

      {/* Results Panel */}
      <div className="space-y-4">
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
            {/* URL / File Source Info */}
            {result.source_url && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center gap-3">
                {result.source_url.startsWith("file://") ? (
                  <>
                    <FileText className="h-4 w-4 text-[#55E039] shrink-0" />
                    <p className="text-sm text-white/70 truncate">{result.source_url.replace("file://", "")}</p>
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 text-[#55E039] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white/40 mb-0.5">Scanned page</p>
                      <a
                        href={result.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#55E039]/80 hover:text-[#55E039] transition-colors truncate block"
                      >
                        {result.page_title || result.source_url}
                      </a>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Score Card */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 flex flex-col items-center shadow-[0_0_30px_rgba(85,224,57,0.05)]">
              <div className="relative">
                <ScoreRing score={result.compliance_score} animate={scoreAnimated} />
                <div className="absolute -top-1 -right-1">
                  <HelpTooltip text="Scores above 80 are generally low risk. Below 50 indicates multiple high-risk violations that should be addressed." />
                </div>
              </div>
              <ScoreExplainer score={result.compliance_score} />
              <p className="mt-4 text-sm text-center text-white/60 leading-relaxed max-w-xs">
                {result.summary}
              </p>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mt-4 text-xs font-medium">
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
                      {/* Element type subtitle (URL scans only) */}
                      {result.source_url && flag.element_type && (
                        <p className="text-xs text-white/40">
                          Found in &lt;{flag.element_type}&gt;
                        </p>
                      )}
                      {/* Context */}
                      {flag.context && (
                        <p className="text-sm text-white/70 leading-relaxed bg-white/[0.02] border border-white/[0.06] rounded-md px-3 py-2">
                          {renderContextWithHighlight(flag.context, flag.matched_text)}
                        </p>
                      )}
                      {/* View on page (URL scans only) */}
                      {result.source_url && !result.source_url.startsWith("file://") && (
                        <a
                          href={buildTextFragmentUrl(result.source_url, flag.matched_text, flag.banned_phrase)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#55E039] hover:text-[#55E039]/80 transition-colors py-1.5 sm:py-0 -my-1.5 sm:my-0"
                        >
                          View on page
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {/* Reason */}
                      <p className="text-sm text-white/50 leading-relaxed">{flag.reason}</p>
                      {/* Alternative */}
                      <div className="flex items-center gap-2 bg-[#55E039]/[0.06] border border-[#55E039]/10 rounded-lg px-3 py-2.5">
                        <Sparkles className="h-3.5 w-3.5 text-[#55E039] shrink-0" />
                        <p className="text-sm text-[#55E039] flex-1 leading-relaxed">
                          {flag.alternative}
                        </p>
                        <button
                          className="shrink-0 p-2.5 sm:p-1.5 rounded-md hover:bg-[#55E039]/10 transition-colors"
                          aria-label="Copy to clipboard"
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
                      <div className="space-y-3">
                        <div className="rounded-lg border border-red-500/10 bg-red-500/[0.04] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-red-400/60 mb-2">Before</p>
                          <p className="text-sm text-white/40 line-through leading-relaxed">{result.flags.map(f => f.matched_text).join(" ... ")}</p>
                        </div>
                        <div className="rounded-lg border border-[#55E039]/20 bg-[#55E039]/[0.04] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#55E039] mb-2">After</p>
                          <p className="text-sm text-white/80 leading-relaxed">{result.rewritten_text}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06] transition-all duration-300 flex items-center justify-center gap-2"
                          aria-label="Copy to clipboard"
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
                          className="py-2.5 px-4 rounded-lg text-sm font-medium border border-[#55E039]/20 bg-[#55E039]/[0.04] text-[#55E039] hover:bg-[#55E039]/[0.08] transition-all duration-300 flex items-center justify-center gap-2"
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
