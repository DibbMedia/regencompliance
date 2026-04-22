"use client"

import Link from "next/link"
import {
  ArrowRight,
  Lock,
  ShieldCheck,
  Eye,
  Database,
  Key,
  FileCheck,
  ChevronDown,
  Building2,
  Server,
  CheckCircle2,
} from "lucide-react"
import { useState } from "react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import { CheckoutButton } from "@/components/checkout-button"
import { IS_LAUNCHED } from "@/lib/env"

const COMMITMENTS = [
  {
    icon: Eye,
    title: "Zero patient data",
    body: "RegenCompliance analyzes marketing content only - website copy, social posts, ads, scripts. We never receive, process, or store PHI. Zero HIPAA implications because we never touch patient records in the first place.",
  },
  {
    icon: Lock,
    title: "Your content is not used for AI training",
    body: "Anthropic's Claude API runs with the no-training setting enabled on every request. Your content is analyzed for the scan, results are returned, and nothing feeds any model's training. This applies to Anthropic's models and every third-party model we might use in the future.",
  },
  {
    icon: Database,
    title: "Encryption at rest and in transit",
    body: "Data encrypted at rest (Supabase managed Postgres with encryption enabled) and in transit (TLS 1.3 for all HTTPS traffic). Supabase also provides row-level security (RLS) for tenant isolation at the database layer.",
  },
  {
    icon: Key,
    title: "No access by RegenCompliance staff without explicit authorization",
    body: "Our staff cannot access your scan content during normal operation. Support-initiated access requires documented authorization and is logged. Your marketing content is your data, visible only to you and your team seats.",
  },
  {
    icon: FileCheck,
    title: "Permanent audit trail of your own usage",
    body: "Every scan, every decision, every export is logged in your account. You always have visibility into what happened in your own account. This is the compliance-evidence trail, not a surveillance mechanism.",
  },
  {
    icon: Server,
    title: "Infrastructure on enterprise-grade providers",
    body: "Hosted on Vercel (frontend + API) and Supabase (database + auth). Both providers operate SOC 2 Type II compliant infrastructure. Payment processing via Stripe (PCI DSS Level 1). AI via Anthropic (enterprise AI provider with documented security practices).",
  },
]

const POLICIES = [
  {
    title: "Data handling",
    body: "Content you submit to RegenCompliance is stored in your account for your audit trail. It's visible only to you and your team seats. It's not shared with other customers, advertising networks, or third-party data brokers. We don't sell, rent, or distribute your content.",
  },
  {
    title: "AI processing",
    body: "Scans run through Anthropic's Claude API with no-training enabled. The scan content passes through Anthropic's infrastructure for processing, returns to us, and we deliver the results to you. Anthropic retains content only for their standard operational logging (which doesn't feed training); we store results in your audit trail.",
  },
  {
    title: "Authentication",
    body: "Account access via Supabase auth - email + password with bcrypt hashing, plus OAuth support where enabled. Password reset requires email verification. Sessions use secure HTTP-only cookies with appropriate expiration.",
  },
  {
    title: "Access controls",
    body: "Your account data is accessible only to authenticated users with valid session tokens for accounts they belong to. Row-level security at the database enforces this - even a bug in application code cannot return data from one account to another.",
  },
  {
    title: "Payment processing",
    body: "Payments processed by Stripe (PCI DSS Level 1). We never see, store, or process raw card data. Our Stripe integration uses restricted API keys with minimum necessary permissions - Checkout, Customers, Subscriptions, Prices, Products, Billing Portal only.",
  },
  {
    title: "Incident response",
    body: "Breach or incident detection triggers our documented response process: investigation, notification to affected customers within 72 hours per GDPR-adjacent best practice, and remediation. We maintain logs sufficient to reconstruct incidents.",
  },
  {
    title: "Data retention and deletion",
    body: "Data retained during active subscription. After cancellation, scan history remains accessible for 30 days (you can export all records as PDF or CSV). After 30 days, data is permanently deleted. Account deletion on request available at any time.",
  },
  {
    title: "Third-party subprocessors",
    body: "Vercel (hosting), Supabase (database/auth), Anthropic (AI), Stripe (payments), Sentry (error monitoring). Each has their own SOC 2 or equivalent attestation. No other subprocessors handle customer content.",
  },
]

const FAQS = [
  {
    q: "Are you HIPAA-compliant?",
    a: "RegenCompliance doesn't receive or process PHI - we handle marketing content only. That means HIPAA technically doesn't apply to our core operations. We operate with SOC-aligned security posture (encryption, access controls, audit logging, incident response) that would satisfy most HIPAA technical requirements if PHI were involved. For practices that want written assurance, we can discuss a Business Associate Agreement (BAA) for specific use cases.",
  },
  {
    q: "Do you have SOC 2?",
    a: "We're pre-audit. Our infrastructure (Vercel, Supabase, Stripe) operates on SOC 2 Type II compliant foundations. Our own SOC 2 audit is on the roadmap. In the meantime, we document our specific security practices publicly and make our subprocessor list available.",
  },
  {
    q: "What happens to my content if I cancel?",
    a: "Scan history remains accessible for 30 days post-cancellation - you can export everything as PDF or CSV during that window. After 30 days, content is permanently deleted. On-demand deletion is available at any time during or after your subscription.",
  },
  {
    q: "Can your staff read my scans?",
    a: "Not in normal operation. Your scan content is protected by authentication and database-level access controls. Our staff can only access customer content via explicit documented authorization (e.g., you raise a support ticket requiring we look at a specific scan). All such access is logged.",
  },
  {
    q: "What AI provider do you use and can I opt out?",
    a: "Anthropic's Claude. Currently we run everything through Anthropic. If you have specific requirements around AI provider choice (e.g., you're required to use a specific provider for your own regulatory reasons), contact us - we can discuss. AI provider diversity is on our roadmap.",
  },
  {
    q: "Are my scans used to improve your models or rule set?",
    a: "Aggregated patterns (anonymized, with no content visible) may inform rule set improvements - e.g., if scans across many practices show a specific phrase is being flagged inconsistently, we may review our rule category. But individual scan content is never used for this; the 'patterns' are counts and categories, not text. Your specific content is yours.",
  },
  {
    q: "What about international data residency?",
    a: "Our infrastructure is US-hosted. Customers outside the US may have specific data residency requirements we can't currently meet. If you're outside the US and need EU or specific-region hosting, contact us - we're evaluating multi-region support.",
  },
  {
    q: "How do you handle security research and vulnerability reports?",
    a: "Good-faith security research is welcome. Report vulnerabilities to security@regencompliance.com. We acknowledge within 24 hours and aim to remediate critical issues within 72 hours and other issues within 30 days. We don't currently have a formal bug bounty program but recognize researchers publicly with permission.",
  },
  {
    q: "Can I get a custom security questionnaire answered?",
    a: "Yes. Enterprise customers with specific security questionnaire requirements can request detailed responses. Contact support@regencompliance.com with your questionnaire; typical turnaround is 5-10 business days.",
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

export default function SecurityClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: PAGE_FAQ_JSONLD }}
      />

      <MarketingBg />
      <MarketingHeader />

      {/* ============ HERO ============ */}
      <section className="relative pt-32 pb-14 sm:pt-36">
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#55E039]/25 bg-[#55E039]/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#55E039] mb-6">
            <ShieldCheck className="h-3 w-3" />
            Security &amp; data handling
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08]">
            How your data is{" "}
            <span className="bg-gradient-to-r from-[#55E039] to-[#89E3E4] bg-clip-text text-transparent">
              actually handled
            </span>
          </h1>
          <p className="mt-6 text-lg text-white/75 leading-relaxed max-w-2xl mx-auto">
            Healthcare practices ask about data handling first. Here&rsquo;s
            the plain-English answer - infrastructure, AI training, access
            controls, encryption, and retention. No surprises.
          </p>
        </div>
      </section>

      {/* ============ CORE COMMITMENTS ============ */}
      <section className="relative py-10">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              The six commitments
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              What we guarantee, in plain English
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {COMMITMENTS.map((c) => {
              const Icon = c.icon
              return (
                <div
                  key={c.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-[#55E039]/25 hover:bg-white/[0.06] transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#55E039]/10 border border-[#55E039]/15 text-[#55E039] mb-4">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug mb-2">
                    {c.title}
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed">{c.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============ POLICY DETAIL ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              The full detail
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Specific policies and practices
            </h2>
          </div>
          <div className="space-y-4">
            {POLICIES.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7"
              >
                <h3 className="text-lg font-bold text-white leading-snug mb-3">
                  {p.title}
                </h3>
                <p className="text-sm sm:text-[15px] text-white/75 leading-relaxed">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ INFRASTRUCTURE ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-[#55E039]/25 bg-[#55E039]/[0.04] p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-6 w-6 text-[#55E039]" aria-hidden />
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Infrastructure stack
              </h2>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2
                  className="h-5 w-5 text-[#55E039] shrink-0 mt-0.5"
                  aria-hidden
                />
                <span className="text-sm sm:text-[15px] text-white/85 leading-relaxed">
                  <span className="font-bold text-white">Vercel</span> - frontend
                  and API hosting. SOC 2 Type II compliant. Edge network with
                  DDoS protection.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2
                  className="h-5 w-5 text-[#55E039] shrink-0 mt-0.5"
                  aria-hidden
                />
                <span className="text-sm sm:text-[15px] text-white/85 leading-relaxed">
                  <span className="font-bold text-white">Supabase</span> -
                  managed PostgreSQL database, authentication, and file storage.
                  SOC 2 Type II compliant. Row-level security enforced at the
                  database layer.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2
                  className="h-5 w-5 text-[#55E039] shrink-0 mt-0.5"
                  aria-hidden
                />
                <span className="text-sm sm:text-[15px] text-white/85 leading-relaxed">
                  <span className="font-bold text-white">Anthropic Claude</span>{" "}
                  - AI processing. No-training setting enabled on every API
                  request. Enterprise AI provider with documented security
                  practices.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2
                  className="h-5 w-5 text-[#55E039] shrink-0 mt-0.5"
                  aria-hidden
                />
                <span className="text-sm sm:text-[15px] text-white/85 leading-relaxed">
                  <span className="font-bold text-white">Stripe</span> - payment
                  processing. PCI DSS Level 1. Restricted API keys with minimum
                  necessary permissions.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2
                  className="h-5 w-5 text-[#55E039] shrink-0 mt-0.5"
                  aria-hidden
                />
                <span className="text-sm sm:text-[15px] text-white/85 leading-relaxed">
                  <span className="font-bold text-white">Sentry</span> - error
                  monitoring. Scrubbed of PII before ingestion. SOC 2 Type II
                  compliant.
                </span>
              </li>
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
              Security questions
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
                    <span className="text-[15px] font-semibold text-white">{faq.q}</span>
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
      <section className="relative py-16">
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Questions we haven&apos;t answered?
          </h2>
          <p className="mt-5 text-base text-white/70 max-w-md mx-auto leading-relaxed">
            Enterprise security questionnaires welcome. Vulnerability reports
            welcome. Reach out at security@regencompliance.com.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3">
            <a
              href="mailto:security@regencompliance.com"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-8 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all"
            >
              Contact Security
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/privacy"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#55E039]/25 bg-[#55E039]/[0.04] px-8 text-[15px] font-semibold text-[#55E039] hover:bg-[#55E039]/[0.08] transition-all"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
