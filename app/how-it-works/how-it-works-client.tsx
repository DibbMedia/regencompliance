"use client"

import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Scan,
  Sparkles,
  Lock,
  BookOpen,
  Bell,
  Shield,
  Zap,
  Clock,
  ChevronDown,
} from "lucide-react"
import { useState } from "react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import { CheckoutButton } from "@/components/checkout-button"
import { IS_LAUNCHED } from "@/lib/env"

const STEPS = [
  {
    n: "01",
    icon: Scan,
    title: "Paste your marketing content",
    body: "Website copy, social post, ad creative, email, call script, blog post. Anything you&rsquo;d publish. Paste, upload a file, or enter a URL.",
    detail:
      "The scanner accepts text (paste), files (.txt, .pdf, .docx), or URLs. No special formatting required. The content can be rough draft, final copy, or already-published marketing you&rsquo;re auditing.",
  },
  {
    n: "02",
    icon: Shield,
    title: "AI scans against live enforcement data",
    body: "Content runs through our rule engine comparing against 300+ patterns sourced from real FDA warning letters and FTC enforcement actions.",
    detail:
      "Runs on Anthropic's Claude (Haiku for the scan, Sonnet for rewrites). Rule set updates daily as new enforcement publishes. Specialty-aware - med spa content gets med-spa-specific pattern matching; weight loss gets GLP-1 specific handling.",
  },
  {
    n: "03",
    icon: Zap,
    title: "Score and flags returned in 30 seconds",
    body: "A 0-100 compliance score plus every flagged phrase highlighted in context, with risk level, rule source, and compliant alternative.",
    detail:
      "The score correlates with real enforcement outcomes in the letters we&rsquo;ve analyzed. HIGH-severity flags represent immediate enforcement triggers; MEDIUM and LOW are substantiation and disclosure concerns. Every flag includes the specific rule and source authority.",
  },
  {
    n: "04",
    icon: Sparkles,
    title: "Accept compliant rewrites",
    body: "Each flag surfaces 2-3 compliant alternatives. Accept, modify, or write your own. The scanner rechecks to confirm the flag is resolved.",
    detail:
      "Rewrites preserve your voice, cite the rule addressed, and offer options rather than a single take-it-or-leave-it suggestion. Bulk rewrite mode handles multi-flag pages in one action.",
  },
  {
    n: "05",
    icon: Lock,
    title: "Audit trail captures everything",
    body: "Every scan is permanently logged with timestamp, user, content, score, flags, and decisions. Exportable as PDF for legal files.",
    detail:
      "Evidence of a functioning compliance program, built as a byproduct of normal use. When regulators ask for proof of pre-publish review, the audit trail is that proof.",
  },
  {
    n: "06",
    icon: Bell,
    title: "Stay ahead of new enforcement",
    body: "Real-time alerts when FDA, FTC, or state enforcement actions affect your specialty. Update marketing before the rule catches you.",
    detail:
      "Alerts filter to what affects your specific practice. New enforcement patterns become new library rules within 24 hours; you know before your current marketing becomes non-compliant.",
  },
]

const TECH_POINTS = [
  {
    icon: Shield,
    title: "Trained on real enforcement, not the open web",
    body: "Every rule in the scanner&rsquo;s engine cites a specific enforcement source. Patterns come from FDA warning letters and FTC settlements, not hypothetical best practices.",
  },
  {
    icon: Clock,
    title: "Daily rule updates",
    body: "Our ingestion pipeline watches federal and state enforcement every day. New cases become new rules within 24 hours - your marketing is never scanned against a stale rule set.",
  },
  {
    icon: CheckCircle2,
    title: "Context-aware, not just keyword matching",
    body: "The engine understands the difference between &lsquo;helps support joint comfort&rsquo; and &lsquo;treats arthritis.&rsquo; Context drives classification, not raw word frequency.",
  },
  {
    icon: Lock,
    title: "Your content is never used for training",
    body: "Anthropic&rsquo;s Claude API with no-training enabled on every request. Content scans, results return, nothing feeds model training anywhere.",
  },
]

const USE_CASES = [
  "Pre-publish review on every social post, ad, and email",
  "Full audit of existing website marketing surfaces",
  "Pre-launch review of new treatment service pages",
  "Response documentation if you receive a warning letter",
  "Team training on specialty-specific claim categories",
  "Agency deliverable review before accepting work",
]

const FAQS = [
  {
    q: "How long does a typical scan take?",
    a: "8-15 seconds for typical marketing content (500-1000 words). Up to 30 seconds for long documents. File uploads add a few seconds for extraction.",
  },
  {
    q: "What&rsquo;s included in the $297/mo founding rate?",
    a: "Unlimited scans, unlimited rewrites, full rule library access, permanent audit trail with PDF/CSV export, daily enforcement alerts, and 3 team seats. Every tool across every specialty.",
  },
  {
    q: "Do I need technical skills to use this?",
    a: "No. Paste content, click scan, review flags, accept rewrites. Marketing managers, front desk staff, physicians, and agency partners all use it without training beyond a short walkthrough.",
  },
  {
    q: "Is there a free way to try it?",
    a: "Yes. The free demo scanner runs at /demo with no card required. Paste any marketing content, see a compliance report, understand exactly what the platform does.",
  },
  {
    q: "How do I know the rules are current?",
    a: "Every rule in the library cites its source. Date of source enforcement and date of last rule update are visible per rule. Daily ingestion means the lag between enforcement publication and rule availability is 24 hours or less.",
  },
  {
    q: "Does it replace my healthcare marketing attorney?",
    a: "No. The scanner handles pattern-matching work that attorney review cannot feasibly do per-item at billing rates. Your attorney continues to handle judgment calls, warning-letter responses, and novel-treatment questions. Most clinics running both reduce routine legal review costs while improving coverage.",
  },
]

const PAGE_FAQ_JSONLD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
})

const HOWTO_JSONLD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How RegenCompliance scans and rewrites healthcare marketing",
  description:
    "Six-step process from pasting content through audit-trail capture. Each step runs in under a minute; full workflow in under 5 minutes.",
  totalTime: "PT5M",
  step: STEPS.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.body.replace(/&rsquo;/g, "'"),
    url: `https://compliance.regenportal.com/how-it-works#step-${i + 1}`,
  })),
})

export default function HowItWorksClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: PAGE_FAQ_JSONLD }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: HOWTO_JSONLD }}
      />

      <MarketingBg />
      <MarketingHeader />

      {/* ============ HERO ============ */}
      <section className="relative pt-32 pb-14 sm:pt-36">
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#55E039]/25 bg-[#55E039]/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#55E039] mb-6">
            <Zap className="h-3 w-3" />
            End-to-end walkthrough
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08]">
            How RegenCompliance{" "}
            <span className="bg-gradient-to-r from-[#55E039] to-[#89E3E4] bg-clip-text text-transparent">
              actually works
            </span>
          </h1>
          <p className="mt-6 text-lg text-white/75 leading-relaxed max-w-2xl mx-auto">
            Six steps, under five minutes end-to-end. Paste content, get a
            compliance score, accept compliant rewrites, export the audit
            trail. No training required; no setup beyond a free trial.
          </p>
        </div>
      </section>

      {/* ============ STEPS ============ */}
      <section className="relative py-8">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="space-y-6">
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.n}
                  id={`step-${parseInt(step.n, 10)}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 sm:p-8 scroll-mt-24"
                >
                  <div className="flex items-start gap-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#55E039]/10 border border-[#55E039]/20 text-[#55E039] shrink-0">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-xs font-mono text-[#55E039]/80">
                          {step.n}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                          {step.title}
                        </h2>
                      </div>
                      <p
                        className="text-base text-white/80 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: step.body }}
                      />
                      <p className="mt-3 text-sm text-white/60 leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============ UNDER THE HOOD ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              Under the hood
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              What makes it work
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {TECH_POINTS.map((p) => {
              const Icon = p.icon
              return (
                <div
                  key={p.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#55E039]/10 border border-[#55E039]/15 text-[#55E039] mb-4">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug mb-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed">{p.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============ WHO USES IT ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-[#55E039]/25 bg-[#55E039]/[0.04] p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-6 w-6 text-[#55E039]" aria-hidden />
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                What teams actually do with it
              </h2>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {USE_CASES.map((item) => (
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

      {/* ============ FAQ ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-2xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              FAQ
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Common questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  className={`w-full text-left rounded-2xl bg-white/[0.03] border px-6 py-5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#55E039]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] ${
                    openFaq === i
                      ? "border-[#55E039]/25 bg-white/[0.06]"
                      : "border-white/10 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className="text-[15px] font-semibold text-white"
                      dangerouslySetInnerHTML={{ __html: faq.q }}
                    />
                    <ChevronDown
                      className={`h-4 w-4 text-white/50 shrink-0 transition-transform duration-300 ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
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
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            See it run on your content
          </h2>
          <p className="mt-5 text-base text-white/70 max-w-md mx-auto leading-relaxed">
            Free demo, 30 seconds, no card. Paste any marketing content, see
            exactly what the scanner flags and how it rewrites.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              href="/demo"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-6 sm:px-8 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all"
            >
              Try the Free Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
            {IS_LAUNCHED ? (
              <CheckoutButton className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#55E039]/25 bg-[#55E039]/[0.04] px-6 sm:px-8 text-[15px] font-semibold text-[#55E039] hover:bg-[#55E039]/[0.08] transition-all cursor-pointer disabled:opacity-70">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </CheckoutButton>
            ) : (
              <Link
                href="/waitlist"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#55E039]/25 bg-[#55E039]/[0.04] px-6 sm:px-8 text-[15px] font-semibold text-[#55E039] hover:bg-[#55E039]/[0.08] transition-all"
              >
                Join the Waitlist
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
