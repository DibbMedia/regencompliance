"use client"

import Link from "next/link"
import {
  ArrowRight,
  Wrench,
  Scan,
  Sparkles,
  Lock,
  BookOpen,
  Bell,
  ChevronDown,
} from "lucide-react"
import { useState } from "react"
import { TOOLS } from "@/lib/tools/registry"
import { HUB_FAQS } from "./hub-faqs"

const TOOL_ICON_MAP: Record<string, typeof Scan> = {
  scanner: Scan,
  "ai-rewriter": Sparkles,
  "audit-trail": Lock,
  "compliance-library": BookOpen,
  "enforcement-alerts": Bell,
}

export function ToolsHubClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative pt-32 pb-14 sm:pt-36">
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#55E039]/25 bg-[#55E039]/[0.08] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#55E039] mb-6">
            <Wrench className="h-3 w-3" />
            Every tool inside RegenCompliance
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08]">
            Five tools.{" "}
            <span className="bg-gradient-to-r from-[#55E039] to-[#89E3E4] bg-clip-text text-transparent">
              One subscription.
            </span>
          </h1>
          <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">
            The compliance scanner that flags violations. The AI rewriter that
            fixes them. The audit trail that documents your program. The rule
            library that backs it all. And enforcement alerts that keep you
            ahead of what&apos;s coming.
          </p>
        </div>
      </section>

      {/* ============ TOOL CARDS ============ */}
      <section className="relative py-8">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="grid gap-5 sm:grid-cols-2 [&>*:nth-child(odd):last-child]:sm:col-span-2 [&>*:nth-child(odd):last-child]:sm:max-w-[calc(50%-0.625rem)] [&>*:nth-child(odd):last-child]:sm:mx-auto [&>*:nth-child(odd):last-child]:sm:w-full">
            {TOOLS.map((t) => {
              const Icon = TOOL_ICON_MAP[t.slug] ?? Wrench
              return (
                <Link
                  key={t.slug}
                  href={`/tools/${t.slug}`}
                  className="group rounded-2xl border border-white/15 bg-white/[0.06] p-7 hover:border-[#55E039]/30 hover:bg-white/[0.10] transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-[#55E039]/15 border border-[#55E039]/25 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-[#55E039]" aria-hidden />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#55E039]/90">
                      {t.category}
                    </p>
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white leading-tight group-hover:text-[#55E039] transition-colors">
                    {t.name}
                  </h2>
                  <p className="mt-3 text-sm text-white/80 leading-relaxed line-clamp-4">
                    {t.shortVerdict}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#55E039]">
                    Learn more
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============ BUNDLE MESSAGE ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-[#55E039]/30 bg-gradient-to-br from-[#55E039]/[0.10] via-[#0a0a0a] to-[#0a0a0a] p-8 sm:p-10 overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#55E039]/[0.10] blur-[80px] rounded-full pointer-events-none" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#55E039] mb-3">
                All five. One subscription.
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-4">
                Built to work together, priced to make sense.
              </h2>
              <p className="text-base sm:text-[17px] text-white/85 leading-relaxed">
                The scanner flags. The rewriter fixes. The audit trail logs.
                The library backs every flag with a source. The alerts keep
                you ahead of new enforcement. No per-tool pricing, no add-on
                tiers. $297/mo founding rate, 3 team seats, unlimited usage
                across every tool.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              Common questions
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              About the tools
            </h2>
          </div>
          <div className="space-y-3">
            {HUB_FAQS.map((faq, i) => (
              <div key={i}>
                <button
                  id={`tools-faq-btn-${i}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`tools-faq-panel-${i}`}
                  className={`w-full text-left rounded-2xl border px-6 py-5 transition-all duration-300 ${
                    openFaq === i
                      ? "border-[#55E039]/30 bg-white/[0.10]"
                      : "border-white/15 bg-white/[0.06] hover:bg-white/[0.10]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[15px] font-semibold text-white pr-4">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-white/60 shrink-0 transition-transform duration-300 ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>
                {openFaq === i && (
                  <div
                    id={`tools-faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`tools-faq-btn-${i}`}
                    className="px-6 pb-5"
                  >
                    <p className="mt-4 text-sm sm:text-[15px] text-white/75 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative py-14">
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Try the scanner first
          </h2>
          <p className="mt-4 text-base text-white/75 max-w-md mx-auto leading-relaxed">
            The free demo runs the scanner on whatever content you paste.
            30 seconds to see exactly what the full platform does.
          </p>
          <div className="mt-8">
            <Link
              href="/demo"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-8 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all"
            >
              Try the Free Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
