"use client"

import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  X,
  ShieldCheck,
  Scale,
  Zap,
  ChevronDown,
  AlertTriangle,
  TrendingUp,
  ArrowLeft,
} from "lucide-react"
import { useState } from "react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import { CheckoutButton } from "@/components/checkout-button"
import { IS_LAUNCHED } from "@/lib/env"
import type { CompetitorMeta } from "@/lib/compare/types"
import {
  RelatedBlogLinks,
  type RelatedBlogPost,
} from "@/components/blog/related-blog-links"

function renderCell(value: true | false | string) {
  if (value === true) {
    return <CheckCircle2 className="h-5 w-5 text-[#55E039] mx-auto" aria-label="Yes" />
  }
  if (value === false) {
    return <X className="h-5 w-5 text-white/25 mx-auto" aria-label="No" />
  }
  return <span className="text-xs sm:text-sm text-white/75 text-center block">{value}</span>
}

export function CompareLayout({
  meta,
  related,
  relatedPosts = [],
}: {
  meta: CompetitorMeta
  related: CompetitorMeta[]
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
            href="/compare"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#55E039] hover:text-[#6FF055] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All comparisons
          </Link>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#55E039]/25 bg-[#55E039]/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#55E039]">
            <Scale className="h-3 w-3" />
            {meta.heroBadge}
          </div>

          <h1 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08]">
            RegenCompliance{" "}
            <span className="text-white/50">vs</span>{" "}
            <span className="bg-gradient-to-r from-[#55E039] to-[#89E3E4] bg-clip-text text-transparent">
              {meta.competitor}
            </span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-white/80 leading-relaxed max-w-3xl">
            {meta.heroTagline}
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039] mb-3">
              The bottom line
            </p>
            <p className="text-base sm:text-[17px] text-white/80 leading-relaxed">
              {meta.bottomLine}
            </p>
          </div>

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

      {/* ============ SHORT VERDICT ============ */}
      <section className="relative py-10">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-[#55E039]/25 bg-gradient-to-br from-[#55E039]/[0.06] via-[#0a0a0a] to-[#0a0a0a] p-8 text-center overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#55E039]/[0.08] blur-[80px] rounded-full pointer-events-none" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#55E039] mb-3">
                Short verdict
              </p>
              <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug max-w-3xl mx-auto">
                {meta.shortVerdict}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHERE THEY WIN ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-white/60 uppercase tracking-[0.2em] mb-3">
              Honest comparison
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Where {meta.competitor} wins
            </h2>
            <p className="mt-4 text-base text-white/65 max-w-2xl mx-auto">
              No product comparison page is useful if it only lists weaknesses. Here is what{" "}
              {meta.competitor} genuinely does well, and where it is the right tool.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {meta.theirStrengths.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-all duration-300"
              >
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-white/70 shrink-0 mt-1" aria-hidden />
                  <h3 className="text-lg font-bold text-white">{s.title}</h3>
                </div>
                <p className="text-sm text-white/70 leading-relaxed pl-8">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHERE WE WIN ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              Where we are purpose-built
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Where RegenCompliance wins
            </h2>
            <p className="mt-4 text-base text-white/65 max-w-2xl mx-auto">
              One category, one rule set, one job. These are the reasons clinics choose a
              purpose-built compliance scanner over a {meta.categoryLabel.toLowerCase()}.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {meta.ourStrengths.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-[#55E039]/20 bg-[#55E039]/[0.04] p-6 hover:bg-[#55E039]/[0.08] transition-all duration-300"
              >
                <div className="flex items-start gap-3 mb-3">
                  <ShieldCheck
                    className="h-5 w-5 text-[#55E039] shrink-0 mt-1"
                    aria-hidden
                  />
                  <h3 className="text-lg font-bold text-white">{s.title}</h3>
                </div>
                <p className="text-sm text-white/75 leading-relaxed pl-8">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURE MATRIX ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              Feature matrix
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              The detailed breakdown
            </h2>
            <p className="mt-4 text-base text-white/65 max-w-2xl mx-auto">
              Every capability, side by side. No asterisks, no marketing gloss.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="text-left text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] text-white/75 px-4 sm:px-5 py-4">
                    Feature
                  </th>
                  <th className="text-center text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] px-4 sm:px-5 py-4">
                    <span className="text-[#55E039]">RegenCompliance</span>
                  </th>
                  <th className="text-center text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] px-4 sm:px-5 py-4 text-white/75">
                    {meta.competitor}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {meta.featureMatrix.map((row) => (
                  <tr key={row.feature} className="hover:bg-white/[0.02] transition-colors">
                    <td className="text-sm text-white/85 px-4 sm:px-5 py-3.5 font-medium">
                      {row.feature}
                      {row.detail && (
                        <p className="text-xs text-white/50 mt-1 leading-relaxed">
                          {row.detail}
                        </p>
                      )}
                    </td>
                    <td className="px-4 sm:px-5 py-3.5 text-center">{renderCell(row.us)}</td>
                    <td className="px-4 sm:px-5 py-3.5 text-center">
                      {renderCell(row.them)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ============ USE CASES ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              When to use which
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Use-case guide
            </h2>
            <p className="mt-4 text-base text-white/65 max-w-2xl mx-auto">
              Specific scenarios, specific recommendations. Some favor {meta.competitor}.
              Some favor us. Most favor both in sequence.
            </p>
          </div>

          <div className="space-y-4">
            {meta.useCases.map((uc) => {
              const winnerLabel =
                uc.winner === "us"
                  ? "RegenCompliance"
                  : uc.winner === "them"
                  ? meta.competitor
                  : "Both, in sequence"
              const winnerColor =
                uc.winner === "us"
                  ? "text-[#55E039] border-[#55E039]/30 bg-[#55E039]/10"
                  : uc.winner === "them"
                  ? "text-amber-300 border-amber-500/30 bg-amber-500/10"
                  : "text-[#89E3E4] border-[#89E3E4]/30 bg-[#89E3E4]/10"
              return (
                <div
                  key={uc.scenario}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7 hover:bg-white/[0.06] transition-all"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg font-bold text-white leading-snug">
                      {uc.scenario}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-[0.15em] rounded-full border px-3 py-1 ${winnerColor} shrink-0`}
                    >
                      Winner: {winnerLabel}
                    </span>
                  </div>
                  <p className="text-sm sm:text-[15px] text-white/70 leading-relaxed">
                    {uc.recommendation}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============ PRICING COMPARE ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Side-by-side cost
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-[#55E039]/40 bg-white/[0.03] p-7 relative overflow-hidden shadow-[0_0_40px_rgba(85,224,57,0.08)]">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#55E039]/70 to-transparent" />
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#55E039]/15 border border-[#55E039]/25 px-3 py-1 text-[10px] font-bold text-[#55E039]">
                  <Zap className="h-3 w-3" />
                  Recommended
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#55E039]/80 mb-2">
                {meta.pricing.us.label}
              </p>
              <p className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-2">
                {meta.pricing.us.price}
              </p>
              <p className="text-sm text-white/70 leading-relaxed">{meta.pricing.us.sub}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/[0.02] p-7">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/55 mb-2">
                {meta.pricing.them.label}
              </p>
              <p className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white/80 mb-2">
                {meta.pricing.them.price}
              </p>
              <p className="text-sm text-white/60 leading-relaxed">{meta.pricing.them.sub}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HONEST LIMITATIONS ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.04] p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-300" aria-hidden />
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Where we are honestly not the right fit
              </h2>
            </div>
            <p className="text-sm text-white/65 leading-relaxed mb-5">
              Every tool has boundaries. These are the scenarios where {meta.competitor} (or
              another approach) is genuinely better than RegenCompliance.
            </p>
            <ul className="space-y-3">
              {meta.honestLimitations.map((lim) => (
                <li
                  key={lim}
                  className="flex items-start gap-3 text-sm text-white/80 leading-relaxed"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
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
              Questions about this comparison
            </h2>
          </div>

          <div className="space-y-3">
            {meta.faqs.map((faq, i) => (
              <div key={i}>
                <button
                  id={`cfaq-btn-${i}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`cfaq-panel-${i}`}
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
                    id={`cfaq-panel-${i}`}
                    role="region"
                    aria-labelledby={`cfaq-btn-${i}`}
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
            Make the switch
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Stop guessing.
            <br />
            Start scanning.
          </h2>
          <p className="mt-5 text-base text-white/70 max-w-md mx-auto leading-relaxed">
            30-second scans. Unlimited runs. Founding rate $297/mo locked in for life.
            Cancel anytime.
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

      {/* ============ RELATED COMPARISONS ============ */}
      {related.length > 0 && (
        <section className="relative py-12">
          <div className="relative mx-auto max-w-5xl px-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039]">
                More comparisons
              </p>
              <Link
                href="/compare"
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
                  href={`/vs/${r.slug}`}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-[#55E039]/25 hover:bg-white/[0.06] transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-[#55E039]/80" aria-hidden />
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#55E039]/80">
                      vs
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug group-hover:text-[#55E039] transition-colors">
                    {r.competitor}
                  </h3>
                  <p className="mt-3 text-sm text-white/60 leading-relaxed line-clamp-3">
                    {r.shortVerdict}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#55E039]">
                    Read comparison
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
        subheading={`Blog posts that go deeper on topics covered in this comparison — enforcement patterns, specialty considerations, and tactical implementation.`}
      />

      <MarketingFooter />
    </div>
  )
}
