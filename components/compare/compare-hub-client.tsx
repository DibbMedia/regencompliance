"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowRight,
  Scale,
  TrendingUp,
  ShieldCheck,
  Zap,
  Brain,
  Search,
  AlertTriangle,
  ChevronDown,
} from "lucide-react"

export interface HubFaq {
  q: string
  a: string
}

interface HubCompetitor {
  slug: string
  competitor: string
  categoryLabel: string
  shortVerdict: string
}

export function CompareHubClient({
  competitors,
  misconceptions,
  faqs,
}: {
  competitors: HubCompetitor[]
  misconceptions: HubFaq[]
  faqs: HubFaq[]
}) {
  const [openMis, setOpenMis] = useState<number | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative pt-32 pb-12 sm:pt-36">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#55E039]/25 bg-[#55E039]/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#55E039] mb-6">
            <Scale className="h-3 w-3" />
            Head-to-head comparisons
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08]">
            How RegenCompliance compares to{" "}
            <span className="bg-gradient-to-r from-[#55E039] to-[#89E3E4] bg-clip-text text-transparent">
              the alternatives
            </span>
          </h1>
          <p className="mt-6 text-lg text-white/75 leading-relaxed max-w-xl mx-auto">
            AI assistants, research tools, grammar checkers, attorneys, and agency audits.
            Where each one wins, and where you need a purpose-built compliance scanner.
          </p>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="relative pb-8">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#55E039]/10 border border-[#55E039]/15 mb-3">
                <Zap className="h-5 w-5 text-[#55E039]" aria-hidden />
              </div>
              <p className="text-sm font-bold text-white mb-2">AI writing tools</p>
              <p className="text-xs text-white/65 leading-relaxed">
                ChatGPT, Jasper, Copy.ai - great for drafting, not a compliance check.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#55E039]/10 border border-[#55E039]/15 mb-3">
                <Brain className="h-5 w-5 text-[#55E039]" aria-hidden />
              </div>
              <p className="text-sm font-bold text-white mb-2">AI assistants</p>
              <p className="text-xs text-white/65 leading-relaxed">
                Claude writes copy that sounds compliant. That is the trap, not the safety.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#55E039]/10 border border-[#55E039]/15 mb-3">
                <Search className="h-5 w-5 text-[#55E039]" aria-hidden />
              </div>
              <p className="text-sm font-bold text-white mb-2">AI research tools</p>
              <p className="text-xs text-white/65 leading-relaxed">
                Perplexity finds what the rule says. It cannot scan your homepage.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#55E039]/10 border border-[#55E039]/15 mb-3">
                <Scale className="h-5 w-5 text-[#55E039]" aria-hidden />
              </div>
              <p className="text-sm font-bold text-white mb-2">Legal & consulting</p>
              <p className="text-xs text-white/65 leading-relaxed">
                Attorneys handle judgment calls. Software handles the volume.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHY AI ALONE IS NOT ENOUGH ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-[#55E039]/25 bg-gradient-to-br from-[#55E039]/[0.06] via-[#0a0a0a] to-[#0a0a0a] p-8 sm:p-10 overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#55E039]/[0.08] blur-[80px] rounded-full pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-6 w-6 text-[#55E039]" aria-hidden />
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Why AI alone is not enough
                </h2>
              </div>
              <p className="text-base sm:text-[17px] text-white/80 leading-relaxed mb-4">
                ChatGPT and Claude write convincingly. That is exactly the problem. They
                were trained on the open web - which is full of healthcare marketing copy
                that has been the subject of FDA warning letters. They produce fluent,
                professional-reading copy in the same voice that draws enforcement, because
                that is the voice they learned from. They have no way to know which
                specific phrase drew a warning letter last week.
              </p>
              <p className="text-base sm:text-[17px] text-white/80 leading-relaxed mb-4">
                Drafting tools and compliance-checking tools are different jobs. A general
                AI assistant is built to be okay at every writing task. A compliance
                scanner is built to be exactly right at one - flagging the specific
                phrasings that violate current FDA and FTC enforcement, with a rule set
                updated daily from active warning letters and consent decrees. The two
                categories will not collapse into each other any more than spreadsheets
                and tax software collapse into each other.
              </p>
              <p className="text-base sm:text-[17px] text-white/80 leading-relaxed mb-4">
                The realistic stack for a healthcare practice in 2026 is three layers. An
                AI tool for drafting (Claude or ChatGPT, around $20/mo). RegenCompliance
                for the operational compliance check on every piece that gets published.
                And a healthcare marketing attorney on retainer for judgment calls and
                warning-letter response. Each owns one job. None of them tries to do
                another&apos;s.
              </p>
              <p className="text-base sm:text-[17px] text-white/80 leading-relaxed">
                AI is not the end-all-be-all of compliance writing. AI is the drafting
                layer. The compliance check is a separate category of tool, built on a
                separate dataset, solving a separate problem. Treating them as
                interchangeable is the most common reason clinics get warning letters in
                spite of using a careful AI for their copy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ COMMON MISCONCEPTIONS ============ */}
      <section className="relative py-12">
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              Common misconceptions
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              The questions clinics ask before switching
            </h2>
          </div>
          <div className="space-y-3">
            {misconceptions.map((faq, i) => (
              <div key={i}>
                <button
                  id={`mis-btn-${i}`}
                  onClick={() => setOpenMis(openMis === i ? null : i)}
                  aria-expanded={openMis === i}
                  aria-controls={`mis-panel-${i}`}
                  className={`w-full text-left rounded-2xl bg-white/[0.06] border px-6 py-5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#55E039]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] ${
                    openMis === i
                      ? "border-[#55E039]/25 bg-white/[0.09]"
                      : "border-white/10 hover:bg-white/[0.09]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[15px] font-semibold text-white">{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-white/50 shrink-0 transition-transform duration-300 ${
                        openMis === i ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>
                {openMis === i && (
                  <div
                    id={`mis-panel-${i}`}
                    role="region"
                    aria-labelledby={`mis-btn-${i}`}
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

      {/* ============ COMPARISON CARDS ============ */}
      <section className="relative py-14">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              Honest head-to-head
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Every alternative, compared honestly
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {competitors.map((c) => (
              <Link
                key={c.slug}
                href={`/vs/${c.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.06] p-7 hover:border-[#55E039]/25 hover:bg-white/[0.09] transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#55E039]/80">
                    {c.categoryLabel}
                  </p>
                  <TrendingUp
                    className="h-4 w-4 text-[#55E039]/60 group-hover:text-[#55E039] transition-colors"
                    aria-hidden
                  />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight text-white leading-tight group-hover:text-[#55E039] transition-colors">
                  vs {c.competitor}
                </h3>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">
                  {c.shortVerdict}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#55E039]">
                  Read comparison
                  <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              FAQ
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Before you pick a tool
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  id={`hubfaq-btn-${i}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`hubfaq-panel-${i}`}
                  className={`w-full text-left rounded-2xl bg-white/[0.06] border px-6 py-5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#55E039]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] ${
                    openFaq === i
                      ? "border-[#55E039]/25 bg-white/[0.09]"
                      : "border-white/10 hover:bg-white/[0.09]"
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
                    id={`hubfaq-panel-${i}`}
                    role="region"
                    aria-labelledby={`hubfaq-btn-${i}`}
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

      {/* ============ CTA ============ */}
      <section className="relative py-14">
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#55E039]/25 bg-[#55E039]/[0.06] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#55E039] mb-5">
            <AlertTriangle className="h-3 w-3" />
            Still comparing?
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Skip the research.
            <br />
            Run your homepage through the free audit.
          </h2>
          <p className="mt-4 text-base text-white/70 max-w-md mx-auto leading-relaxed">
            Paste a URL. Get a violation count, severity breakdown, and the first two
            flagged issues expanded. No card required, no pitch deck.
          </p>
          <div className="mt-8">
            <Link
              href="/free-audit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-8 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all"
            >
              Run the Free Audit
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
