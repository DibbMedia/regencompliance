"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowRight,
  Loader2,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Globe,
} from "lucide-react"
import { toast } from "sonner"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { MarketingBg } from "@/components/marketing-bg"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { freeAuditSchema, type FreeAuditInput } from "@/lib/validations"

type PublicFlag = {
  matched_text: string | null
  banned_phrase: string | null
  risk_level: "high" | "medium" | "low"
  reason: string | null
  alternative: string | null
  context: string | null
  element_type: string | null
  locked: boolean
}

type AuditResult = {
  website_url: string
  page_title: string | null
  compliance_score: number | null
  summary: string | null
  flag_count: number
  high_risk_count: number
  medium_risk_count: number
  low_risk_count: number
  flags: PublicFlag[]
  unlocked: number
  locked: number
}

const RISK_BG: Record<PublicFlag["risk_level"], string> = {
  high: "bg-red-500/10 border-red-500/30",
  medium: "bg-orange-500/10 border-orange-500/30",
  low: "bg-yellow-500/10 border-yellow-500/30",
}
const RISK_LABEL: Record<PublicFlag["risk_level"], string> = {
  high: "High risk",
  medium: "Medium risk",
  low: "Low risk",
}
const RISK_TEXT: Record<PublicFlag["risk_level"], string> = {
  high: "text-red-400",
  medium: "text-orange-300",
  low: "text-yellow-300",
}

function scoreColor(score: number | null) {
  if (score == null) return "text-white/60"
  if (score >= 80) return "text-[#55E039]"
  if (score >= 60) return "text-yellow-300"
  if (score >= 40) return "text-orange-300"
  return "text-red-400"
}

export function FreeAuditForm() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AuditResult | null>(null)

  const form = useForm<FreeAuditInput>({
    resolver: zodResolver(freeAuditSchema),
    defaultValues: { website_url: "", email: "", name: "", clinic_name: "", accept_terms: false as unknown as true },
  })

  async function onSubmit(values: FreeAuditInput) {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/free-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(data.error || "Something went wrong. Please try again.")
        setLoading(false)
        return
      }

      setResult(data as AuditResult)
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
      <MarketingBg />
      <MarketingHeader />

      <main className="relative z-10 mx-auto max-w-4xl px-6 pt-32 pb-20">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#55E039]/20 bg-[#55E039]/[0.04] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#55E039] shadow-[0_0_30px_rgba(85,224,57,0.08)]">
            <Sparkles className="h-3 w-3" />
            Free FDA/FTC Audit
          </div>
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Find every compliance violation on your{" "}
            <span className="bg-gradient-to-r from-[#55E039] to-[#3BB82A] bg-clip-text text-transparent">
              homepage
            </span>{" "}
            in 30 seconds.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/60 max-w-2xl mx-auto">
            Drop in your URL. We&apos;ll scan it against live FDA warning letters and FTC enforcement actions, then send you the full report. No card, no signup.
          </p>
        </div>

        {!result && (
          <div className="mt-10 mx-auto max-w-xl">
            <div className="relative">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[#55E039]/30 to-transparent opacity-40 blur-sm" />
              <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-xl">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="website_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                            Website URL to scan
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/55" />
                              <Input
                                type="url"
                                placeholder="https://yourclinic.com"
                                autoComplete="url"
                                disabled={loading}
                                className="h-11 pl-9 bg-white/[0.03] border-white/10 text-white placeholder:text-white/50 focus-visible:border-[#55E039]/40 focus-visible:ring-[#55E039]/20"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                            Email for the report
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@yourclinic.com"
                              autoComplete="email"
                              disabled={loading}
                              className="h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-white/50 focus-visible:border-[#55E039]/40 focus-visible:ring-[#55E039]/20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="accept_terms"
                      render={({ field }) => (
                        <FormItem className="rounded-xl border border-white/15 bg-white/[0.04] p-4">
                          <div className="flex items-start gap-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value === true}
                                onCheckedChange={(v: boolean | "indeterminate") => field.onChange(v === true)}
                                disabled={loading}
                                className="mt-0.5 border-white/30 data-[state=checked]:bg-[#55E039] data-[state=checked]:border-[#55E039] data-[state=checked]:text-[#0a0a0a]"
                              />
                            </FormControl>
                            <div className="flex-1">
                              <FormLabel className="text-sm font-semibold text-white leading-relaxed cursor-pointer">
                                I agree to the{" "}
                                <Link href="/terms" className="text-[#55E039] hover:text-[#6FF055] underline">terms</Link>
                                {" "}and{" "}
                                <Link href="/privacy" className="text-[#55E039] hover:text-[#6FF055] underline">privacy policy</Link>
                              </FormLabel>
                              <p className="mt-1 text-xs text-white/65 leading-relaxed">
                                We&apos;ll scan your URL once and email you the report. Unsubscribe anytime.
                              </p>
                              <FormMessage className="mt-2" />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Scanning your page...
                        </>
                      ) : (
                        <>
                          Run my free audit
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                </Form>
              </div>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3 text-center">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-2xl font-extrabold text-[#55E039]">300+</p>
                <p className="mt-1 text-xs text-white/65">FDA/FTC enforcement rules</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-2xl font-extrabold text-[#55E039]">~30s</p>
                <p className="mt-1 text-xs text-white/65">Average scan time</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-2xl font-extrabold text-[#55E039]">$0</p>
                <p className="mt-1 text-xs text-white/65">No card, no commitment</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-10 space-y-8">
            {/* Score header */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <p className="text-xs font-bold text-white/65 uppercase tracking-[0.2em] mb-2">Audit complete</p>
                  <p className="text-sm text-white/70 break-all">{result.website_url}</p>
                  {result.page_title && (
                    <p className="mt-1 text-sm text-white font-semibold">{result.page_title}</p>
                  )}
                  {result.summary && (
                    <p className="mt-3 text-sm text-white/75 max-w-xl leading-relaxed">{result.summary}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-white/55 uppercase tracking-wider">Compliance score</p>
                    <p className={`text-5xl font-extrabold ${scoreColor(result.compliance_score)}`}>
                      {result.compliance_score ?? "-"}
                      <span className="text-2xl text-white/55">/100</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                <Stat label="Total flags" value={result.flag_count} icon={<AlertTriangle className="h-4 w-4 text-white/60" />} />
                <Stat label="High risk" value={result.high_risk_count} icon={<ShieldAlert className="h-4 w-4 text-red-400" />} accent="text-red-400" />
                <Stat label="Medium risk" value={result.medium_risk_count} icon={<ShieldAlert className="h-4 w-4 text-orange-300" />} accent="text-orange-300" />
                <Stat label="Low risk" value={result.low_risk_count} icon={<ShieldCheck className="h-4 w-4 text-yellow-300" />} accent="text-yellow-300" />
              </div>
            </div>

            {/* Flags */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-white">What we found</h2>
                <p className="text-xs text-white/65">
                  Showing {result.unlocked} of {result.flag_count} violations in detail
                  {result.locked > 0 ? ` - ${result.locked} more locked` : ""}
                </p>
              </div>

              {result.flag_count === 0 ? (
                <div className="rounded-2xl border border-[#55E039]/20 bg-[#55E039]/[0.04] p-6 text-center">
                  <ShieldCheck className="mx-auto h-8 w-8 text-[#55E039]" />
                  <p className="mt-3 text-base font-bold text-white">No violations detected</p>
                  <p className="mt-1 text-sm text-white/70 max-w-md mx-auto">
                    Your page is clean against our current rule set. Great work. Sign up for monitoring so you stay clean as new FDA/FTC enforcement lands.
                  </p>
                </div>
              ) : (
                result.flags.map((flag, i) => (
                  <FlagCard key={i} flag={flag} index={i} />
                ))
              )}
            </div>

            {/* CTA */}
            {result.flag_count > 0 && (
              <div className="rounded-2xl border border-[#55E039]/20 bg-gradient-to-br from-[#55E039]/[0.08] to-transparent p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {result.locked > 0
                        ? `Unlock all ${result.flag_count} violations + AI rewrites`
                        : "Get the AI rewrites + ongoing monitoring"}
                    </h3>
                    <p className="mt-2 text-sm text-white/70 max-w-xl leading-relaxed">
                      RegenCompliance scans every page on your site, rewrites violations into compliant alternatives, and watches for new enforcement daily. Founder beta is $297/mo locked for life - 25 seats, application required.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                    <Link
                      href="/apply"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-6 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:brightness-110 transition-all"
                    >
                      Apply for Beta
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/pricing"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 text-[15px] font-semibold text-white/80 hover:bg-white/[0.08] transition-all"
                    >
                      View pricing
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => { setResult(null); form.reset() }}
              className="block mx-auto text-sm text-white/65 hover:text-white transition-colors"
            >
              Scan another URL
            </button>
          </div>
        )}
      </main>

      <MarketingFooter />
    </div>
  )
}

function Stat({ label, value, icon, accent }: { label: string; value: number; icon: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[10px] font-bold text-white/65 uppercase tracking-wider">{label}</p>
      </div>
      <p className={`mt-2 text-2xl font-extrabold ${accent ?? "text-white"}`}>{value}</p>
    </div>
  )
}

function FlagCard({ flag, index }: { flag: PublicFlag; index: number }) {
  if (flag.locked) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${RISK_BG[flag.risk_level]} ${RISK_TEXT[flag.risk_level]}`}>
                {RISK_LABEL[flag.risk_level]}
              </span>
              {flag.element_type && (
                <span className="text-[10px] text-white/65 font-mono uppercase">&lt;{flag.element_type}&gt;</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-white/55 shrink-0" />
              <p className="text-sm text-white/70 italic">
                Violation #{index + 1} - sign up to reveal the matched phrase, why it&apos;s flagged, and a compliant rewrite.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border p-5 ${RISK_BG[flag.risk_level]}`}>
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${RISK_BG[flag.risk_level]} ${RISK_TEXT[flag.risk_level]}`}>
            {RISK_LABEL[flag.risk_level]}
          </span>
          {flag.element_type && (
            <span className="text-[10px] text-white/55 font-mono uppercase">&lt;{flag.element_type}&gt;</span>
          )}
        </div>
        <span className="text-[10px] text-white/65">Violation #{index + 1}</span>
      </div>
      {flag.matched_text && (
        <div className="mb-3">
          <p className="text-[10px] font-bold text-white/65 uppercase tracking-wider mb-1">Matched phrase</p>
          <p className="text-sm font-semibold text-white">&ldquo;{flag.matched_text}&rdquo;</p>
        </div>
      )}
      {flag.context && flag.context !== flag.matched_text && (
        <div className="mb-3">
          <p className="text-[10px] font-bold text-white/65 uppercase tracking-wider mb-1">In context</p>
          <p className="text-sm text-white/75 italic leading-relaxed">{flag.context}</p>
        </div>
      )}
      {flag.reason && (
        <div className="mb-3">
          <p className="text-[10px] font-bold text-white/65 uppercase tracking-wider mb-1">Why it&apos;s flagged</p>
          <p className="text-sm text-white/85 leading-relaxed">{flag.reason}</p>
        </div>
      )}
      {flag.alternative && (
        <div className="rounded-lg border border-[#55E039]/20 bg-[#55E039]/[0.06] p-3">
          <p className="text-[10px] font-bold text-[#55E039] uppercase tracking-wider mb-1">Compliant rewrite</p>
          <p className="text-sm text-white">&ldquo;{flag.alternative}&rdquo;</p>
        </div>
      )}
    </div>
  )
}
