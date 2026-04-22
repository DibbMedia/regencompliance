"use client"

import Link from "next/link"
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Wrench,
  Sparkles,
  ShieldCheck,
  Scan,
  BookOpen,
  Bell,
  Lock,
} from "lucide-react"
import { useState } from "react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import { CheckoutButton } from "@/components/checkout-button"
import { IS_LAUNCHED } from "@/lib/env"
import type { ToolMeta } from "@/lib/tools/types"
import {
  RelatedBlogLinks,
  type RelatedBlogPost,
} from "@/components/blog/related-blog-links"

const TOOL_ICON_MAP: Record<string, typeof Scan> = {
  scanner: Scan,
  "ai-rewriter": Sparkles,
  "audit-trail": Lock,
  "compliance-library": BookOpen,
  "enforcement-alerts": Bell,
}

function ToolIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = TOOL_ICON_MAP[slug] ?? Wrench
  return <Icon className={className} aria-hidden />
}

export function ToolLayout({
  meta,
  related,
  relatedPosts = [],
}: {
  meta: ToolMeta
  related: ToolMeta[]
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
            href="/tools"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#55E039] hover:text-[#6FF055] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All tools
          </Link>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#55E039]/25 bg-[#55E039]/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#55E039]">
            <ToolIcon slug={meta.slug} className="h-3 w-3" />
            {meta.heroBadge}
          </div>

          <h1 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08]">
            <span className="bg-gradient-to-r from-[#55E039] to-[#89E3E4] bg-clip-text text-transparent">
              {meta.name}
            </span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-white/80 leading-relaxed max-w-3xl">
            {meta.heroTagline}
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039] mb-3">
              Short verdict
            </p>
            <p className="text-base sm:text-[17px] text-white/80 leading-relaxed">
              {meta.shortVerdict}
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

      {/* ============ WHAT IT IS ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-[#55E039]/25 bg-gradient-to-br from-[#55E039]/[0.06] via-[#0a0a0a] to-[#0a0a0a] p-8 sm:p-10 overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#55E039]/[0.08] blur-[80px] rounded-full pointer-events-none" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#55E039] mb-3">
                What it is
              </p>
              <p className="text-base sm:text-[17px] text-white/85 leading-relaxed">
                {meta.whatItIs}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CAPABILITIES ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              Capabilities
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              What it does
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {meta.capabilities.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-[#55E039]/25 hover:bg-white/[0.06] transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-[#55E039] shrink-0 mt-1" aria-hidden />
                  <h3 className="text-lg font-bold text-white leading-snug">
                    {c.title}
                  </h3>
                </div>
                <p className="text-sm text-white/70 leading-relaxed pl-8">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Step by step
            </h2>
          </div>

          <div className="space-y-4">
            {meta.howItWorks.map((step, i) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#55E039]/10 border border-[#55E039]/20 text-[#55E039] text-sm font-bold font-mono shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white leading-snug mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-[15px] text-white/70 leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ USE CASES ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              Use cases
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              How practices actually use it
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {meta.useCases.map((u) => (
              <div
                key={u.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-all"
              >
                <h3 className="text-lg font-bold text-white leading-snug mb-3">
                  {u.title}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">{u.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ INCLUDED ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-[#55E039]/25 bg-[#55E039]/[0.04] p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="h-6 w-6 text-[#55E039]" aria-hidden />
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Included in your subscription
              </h2>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {meta.included.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    className="h-5 w-5 text-[#55E039] shrink-0 mt-0.5"
                    aria-hidden
                  />
                  <span className="text-sm sm:text-[15px] text-white/85 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============ WHAT IT ISNT ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.04] p-8 sm:p-10">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-3">
              What {meta.name} isn&apos;t
            </h2>
            <p className="text-sm text-white/65 leading-relaxed mb-5">
              Honest positioning: what this tool does and doesn&apos;t do, so
              you can decide whether it fits your need.
            </p>
            <ul className="space-y-3">
              {meta.whatItIsnt.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-white/80 leading-relaxed"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{item}</span>
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
              {meta.name} questions
            </h2>
          </div>

          <div className="space-y-3">
            {meta.faqs.map((faq, i) => (
              <div key={i}>
                <button
                  id={`tfaq-btn-${i}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`tfaq-panel-${i}`}
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
                    id={`tfaq-panel-${i}`}
                    role="region"
                    aria-labelledby={`tfaq-btn-${i}`}
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
            Ready to try {meta.name}?
          </h2>
          <p className="mt-5 text-base text-white/70 max-w-md mx-auto leading-relaxed">
            Included in every RegenCompliance subscription. Unlimited usage.
            Founding rate $297/mo locked for life.
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

      {/* ============ RELATED TOOLS ============ */}
      {related.length > 0 && (
        <section className="relative py-12">
          <div className="relative mx-auto max-w-5xl px-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039]">
                Other tools
              </p>
              <Link
                href="/tools"
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
                  href={`/tools/${r.slug}`}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-[#55E039]/25 hover:bg-white/[0.06] transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <ToolIcon slug={r.slug} className="h-4 w-4 text-[#55E039]/80" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#55E039]/80">
                      {r.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug group-hover:text-[#55E039] transition-colors">
                    {r.name}
                  </h3>
                  <p className="mt-3 text-sm text-white/60 leading-relaxed line-clamp-3">
                    {r.shortVerdict}
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
        subheading={`Blog posts that cover ${meta.name.toLowerCase()} in real-world healthcare compliance scenarios.`}
      />

      <MarketingFooter />
    </div>
  )
}
