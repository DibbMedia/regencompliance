"use client"

import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Scan,
  ChevronDown,
  ArrowLeft,
  Users,
  Building2,
  Sparkles,
} from "lucide-react"
import { useState } from "react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import { CheckoutButton } from "@/components/checkout-button"
import { IS_LAUNCHED } from "@/lib/env"
import type { SpecialtyMeta } from "@/lib/specialty/types"
import {
  RelatedBlogLinks,
  type RelatedBlogPost,
} from "@/components/blog/related-blog-links"

function riskBadge(level: "HIGH" | "MEDIUM" | "LOW") {
  if (level === "HIGH") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-red-300">
        High
      </span>
    )
  }
  if (level === "MEDIUM") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-300">
        Medium
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
      Low
    </span>
  )
}

export function SpecialtyLayout({
  meta,
  related,
  relatedPosts = [],
}: {
  meta: SpecialtyMeta
  related: SpecialtyMeta[]
  relatedPosts?: RelatedBlogPost[]
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <MarketingBg />
      <MarketingHeader />

      {/* ============ HERO ============ */}
      <section className="relative pt-32 pb-12 sm:pt-36">
        <div className="relative mx-auto max-w-4xl px-6">
          <Link
            href="/for"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#55E039] hover:text-[#6FF055] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All specialties
          </Link>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#55E039]/25 bg-[#55E039]/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#55E039]">
            <Sparkles className="h-3 w-3" />
            {meta.heroBadge}
          </div>

          <h1 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08]">
            Compliance software built for{" "}
            <span className="bg-gradient-to-r from-[#55E039] to-[#89E3E4] bg-clip-text text-transparent">
              {meta.specialty}
            </span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-white/80 leading-relaxed max-w-3xl">
            {meta.heroTagline}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
            {IS_LAUNCHED ? (
              <CheckoutButton className="inline-flex h-12 w-full sm:w-auto items-center justify-center sm:justify-start gap-2.5 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-6 sm:px-8 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-70">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </CheckoutButton>
            ) : (
              <Link
                href="/waitlist"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center sm:justify-start gap-2.5 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-6 sm:px-8 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all cursor-pointer"
              >
                Join the Waitlist
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              href="/demo"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center sm:justify-start gap-2.5 rounded-xl border border-[#55E039]/25 bg-[#55E039]/[0.04] px-6 sm:px-8 text-[15px] font-semibold text-[#55E039] hover:bg-[#55E039]/[0.08] transition-all"
            >
              Try Free Demo
              <ArrowRight className="h-4 w-4 opacity-70" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ RISK SUMMARY ============ */}
      <section className="relative py-10">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.03] p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-5">
              <AlertTriangle className="h-6 w-6 text-red-400" aria-hidden />
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Why this specialty is exposed
              </h2>
            </div>
            <p className="text-base sm:text-[17px] text-white/80 leading-relaxed">
              {meta.riskSummary}
            </p>
          </div>
        </div>
      </section>

      {/* ============ ENFORCEMENT EXAMPLES ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-red-400 uppercase tracking-[0.2em] mb-3">
              Active enforcement
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              What regulators are actually doing
            </h2>
            <p className="mt-4 text-base text-white/65 max-w-2xl mx-auto">
              Real FDA warning letters, FTC settlements, and state board actions shaping
              marketing rules for {meta.specialty.toLowerCase()} right now.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {meta.enforcementExamples.map((ex) => (
              <div
                key={ex.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-1" aria-hidden />
                  <h3 className="text-lg font-bold text-white leading-snug">{ex.title}</h3>
                </div>
                <p className="text-sm text-white/70 leading-relaxed pl-8">{ex.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BANNED PHRASES ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              Specialty-specific phrase library
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Banned phrases we catch (and the compliant alternatives)
            </h2>
            <p className="mt-4 text-base text-white/65 max-w-2xl mx-auto">
              Every phrase below is from real enforcement actions. RegenCompliance flags
              them automatically on every scan — with the compliant alternative ready.
            </p>
          </div>

          <div className="space-y-4">
            {meta.bannedPhrases.map((bp) => (
              <div
                key={bp.phrase}
                className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-red-400 mb-2">
                        Non-compliant
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-red-300">
                        &ldquo;{bp.phrase}&rdquo;
                      </p>
                    </div>
                    {riskBadge(bp.risk)}
                  </div>
                  <p className="text-sm text-white/65 leading-relaxed mb-4">
                    <span className="font-semibold text-white/80">Why: </span>
                    {bp.why}
                  </p>
                  <div className="pt-4 border-t border-white/[0.06]">
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#55E039] mb-2">
                      Compliant alternative
                    </p>
                    <p className="text-sm sm:text-[15px] text-[#55E039]/90 leading-relaxed">
                      &ldquo;{bp.alternative}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COMMON CATCHES ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              On every scan
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              What we catch that generic tools miss
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {meta.commonCatches.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-[#55E039]/20 bg-[#55E039]/[0.04] p-6 hover:bg-[#55E039]/[0.08] transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <ShieldCheck className="h-5 w-5 text-[#55E039] shrink-0 mt-1" aria-hidden />
                  <h3 className="text-lg font-bold text-white leading-snug">{c.title}</h3>
                </div>
                <p className="text-sm text-white/75 leading-relaxed pl-8">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CASE STUDY ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              Case study
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {meta.caseStudy.title}
            </h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
              <div className="p-6 sm:p-7 bg-red-500/[0.03]">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="h-4 w-4 text-red-400" aria-hidden />
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-red-400">
                    Before
                  </span>
                </div>
                <p className="text-[15px] leading-[1.65] text-white/85">
                  &ldquo;{meta.caseStudy.before}&rdquo;
                </p>
              </div>
              <div className="p-6 sm:p-7 bg-[#55E039]/[0.03]">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-[#55E039]" aria-hidden />
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#55E039]">
                    After
                  </span>
                </div>
                <p className="text-[15px] leading-[1.65] text-white/85">
                  &ldquo;{meta.caseStudy.after}&rdquo;
                </p>
              </div>
            </div>
            <div className="border-t border-white/10 bg-white/[0.02] px-6 sm:px-7 py-5">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#55E039] mb-2">
                Outcome
              </p>
              <p className="text-sm sm:text-[15px] text-white/75 leading-relaxed">
                {meta.caseStudy.outcome}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ UNIQUE VALUE ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-[#55E039]/25 bg-gradient-to-br from-[#55E039]/[0.08] via-[#0a0a0a] to-[#0a0a0a] p-8 sm:p-10 overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#55E039]/[0.08] blur-[80px] rounded-full pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <Scan className="h-6 w-6 text-[#55E039]" aria-hidden />
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Why RegenCompliance vs. generic tools
                </h2>
              </div>
              <p className="text-base sm:text-[17px] text-white/80 leading-relaxed">
                {meta.uniqueValue}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHO THIS IS FOR ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              Who uses this
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Built for every practice type in this specialty
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {meta.whoThisIsFor.map((who) => (
              <div
                key={who}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <Building2 className="h-4 w-4 text-[#55E039]/70 shrink-0 mt-1" aria-hidden />
                <span className="text-sm text-white/80 leading-relaxed">{who}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TOOLS FOR THIS SPECIALTY ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              Tools in the platform
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              What you actually get for {meta.specialty.toLowerCase()}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/tools/scanner"
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-[#55E039]/25 hover:bg-white/[0.06] transition-all"
            >
              <h3 className="text-base font-bold text-white leading-snug group-hover:text-[#55E039] transition-colors">
                Compliance Scanner
              </h3>
              <p className="mt-2 text-sm text-white/65 leading-relaxed">
                {meta.specialty}-specific rule calibration. Flags disease
                claims, FDA misuse, and specialty-specific patterns.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#55E039]">
                Learn more
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
            <Link
              href="/tools/ai-rewriter"
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-[#55E039]/25 hover:bg-white/[0.06] transition-all"
            >
              <h3 className="text-base font-bold text-white leading-snug group-hover:text-[#55E039] transition-colors">
                AI Compliant Rewriter
              </h3>
              <p className="mt-2 text-sm text-white/65 leading-relaxed">
                Turn flagged {meta.specialty.toLowerCase()} claims into
                compliant alternatives that preserve your voice.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#55E039]">
                Learn more
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
            <Link
              href="/tools/audit-trail"
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-[#55E039]/25 hover:bg-white/[0.06] transition-all"
            >
              <h3 className="text-base font-bold text-white leading-snug group-hover:text-[#55E039] transition-colors">
                Audit Trail + PDF Export
              </h3>
              <p className="mt-2 text-sm text-white/65 leading-relaxed">
                Permanent evidence of your pre-publish compliance review.
                Regulatory-ready format.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#55E039]">
                Learn more
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#55E039] hover:text-[#6FF055] transition-colors"
            >
              See all five tools
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-2xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              FAQ
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Specialty-specific questions
            </h2>
          </div>

          <div className="space-y-3">
            {meta.faqs.map((faq, i) => (
              <div key={i}>
                <button
                  id={`sfaq-btn-${i}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`sfaq-panel-${i}`}
                  className={`w-full text-left rounded-2xl bg-white/[0.03] border px-6 py-5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#55E039]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] ${
                    openFaq === i
                      ? "border-[#55E039]/25 bg-white/[0.06]"
                      : "border-white/10 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[15px] font-semibold text-white">{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-white/50 shrink-0 transition-transform duration-300 ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>
                {openFaq === i && (
                  <div
                    id={`sfaq-panel-${i}`}
                    role="region"
                    aria-labelledby={`sfaq-btn-${i}`}
                    className="px-6 pb-5"
                  >
                    <p className="mt-4 text-sm sm:text-[15px] text-white/70 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#55E039]/[0.04] to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#55E039]/[0.06] blur-[120px] rounded-full pointer-events-none" />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
            Get started
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Protect your practice.
            <br />
            Start scanning in 30 seconds.
          </h2>
          <p className="mt-5 text-base text-white/70 max-w-md mx-auto leading-relaxed">
            Unlimited scans. 3 team seats. Founding rate $297/mo locked for life.
            30-day money-back guarantee.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-4">
            {IS_LAUNCHED ? (
              <CheckoutButton className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-6 sm:px-8 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-70">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </CheckoutButton>
            ) : (
              <Link
                href="/waitlist"
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-6 sm:px-8 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all cursor-pointer"
              >
                Join the Waitlist
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              href="/demo"
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl border border-[#55E039]/25 bg-[#55E039]/[0.04] px-6 sm:px-8 text-[15px] font-semibold text-[#55E039] hover:bg-[#55E039]/[0.08] transition-all"
            >
              Try Demo First
            </Link>
          </div>
        </div>
      </section>

      {/* ============ RELATED SPECIALTIES ============ */}
      {related.length > 0 && (
        <section className="relative py-12">
          <div className="relative mx-auto max-w-5xl px-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039]">
                Other specialties
              </p>
              <Link
                href="/for"
                className="text-xs font-semibold text-white/70 hover:text-white transition-colors flex items-center gap-1"
              >
                See all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/for/${r.slug}`}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-[#55E039]/25 hover:bg-white/[0.06] transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-[#55E039]/80" aria-hidden />
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#55E039]/80">
                      For
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug group-hover:text-[#55E039] transition-colors">
                    {r.specialty}
                  </h3>
                  <p className="mt-3 text-sm text-white/60 leading-relaxed line-clamp-3">
                    {r.heroTagline}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#55E039]">
                    Learn more
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <RelatedBlogLinks
        posts={relatedPosts}
        heading="Further reading"
        subheading={`Blog posts covering enforcement, claim categories, and tactical playbooks specifically relevant to ${meta.specialty.toLowerCase()}.`}
      />

      <MarketingFooter />
    </div>
  )
}
