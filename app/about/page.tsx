import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  Target,
  ShieldCheck,
  Eye,
  Users,
  Building2,
  Mail,
} from "lucide-react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"

const canonical = "https://compliance.regenportal.com/about"

export const metadata: Metadata = {
  title: "About RegenCompliance — Built for Real Healthcare Compliance Work",
  description:
    "About the RegenCompliance team, why we built purpose-built FDA/FTC compliance software for healthcare practices, and the principles that shape the product.",
  keywords: [
    "about RegenCompliance",
    "Dibb Media RegenCompliance",
    "healthcare compliance software company",
    "FDA compliance startup",
  ],
  alternates: { canonical },
  openGraph: {
    title: "About RegenCompliance",
    description:
      "Purpose-built FDA/FTC compliance software for healthcare practices. Built and operated by Dibb Media.",
    url: canonical,
    type: "website",
  },
}

const PRINCIPLES = [
  {
    icon: Target,
    title: "Purpose-built, not generalist",
    body: "Generic AI and marketing tools solve generic problems. FDA/FTC compliance is specific. Our rule engine, training data, and workflow all reflect that specificity. We'd rather be the best tool at one thing than a mediocre tool at many.",
  },
  {
    icon: Eye,
    title: "Honest positioning",
    body: "Every comparison page says where competitors win. Every tool page says what the tool isn't. Every specialty page acknowledges the edge cases we don't cover. Healthcare buyers can smell marketing that overpromises — honesty works better long-term.",
  },
  {
    icon: ShieldCheck,
    title: "Evidence over opinion",
    body: "Every rule in the library cites its source. Every blog post references real enforcement. Every compliance claim traces to an actual FDA letter or FTC case. We don't publish 'experts say' — we publish 'here's the specific warning letter.'",
  },
  {
    icon: Users,
    title: "Built for compliance teams, not compliance theater",
    body: "Audit trails, pre-publish review workflows, documented compliance programs — because that's what actually works when regulators ask questions. Compliance theater (vague policies, one-time training) is worse than nothing because it creates false confidence.",
  },
]

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About RegenCompliance",
    description:
      "About the RegenCompliance team, why we built FDA/FTC compliance software for healthcare practices, and the principles behind the product.",
    url: canonical,
    mainEntity: {
      "@type": "Organization",
      name: "RegenCompliance",
      parentOrganization: { "@type": "Organization", name: "Dibb Media" },
      url: "https://compliance.regenportal.com",
    },
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://compliance.regenportal.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "About",
        item: canonical,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <MarketingBg />
      <MarketingHeader />

      {/* ============ HERO ============ */}
      <section className="relative pt-32 pb-14 sm:pt-36">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#55E039]/25 bg-[#55E039]/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#55E039] mb-6">
            <Building2 className="h-3 w-3" />
            About RegenCompliance
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08]">
            Built for the compliance work{" "}
            <span className="bg-gradient-to-r from-[#55E039] to-[#89E3E4] bg-clip-text text-transparent">
              healthcare practices actually need
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/80 leading-relaxed max-w-3xl">
            RegenCompliance is FDA/FTC compliance software for healthcare
            practices &mdash; regenerative medicine, med spas, weight loss,
            dental, aesthetic, and the specialties that live inside active
            enforcement environments. We built it because the existing
            options didn&rsquo;t fit.
          </p>
        </div>
      </section>

      {/* ============ WHY BUILT ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
                Why we built this
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-5">
                The gap between what was available and what clinics actually
                needed
              </h2>
            </div>
            <p className="text-base sm:text-[17px] text-white/80 leading-relaxed">
              Healthcare practices marketing FDA- or FTC-regulated treatments
              have three typical compliance options: hire a healthcare
              marketing attorney at $400-$800 per hour, run a manual agency
              audit once a year for tens of thousands of dollars, or cross
              their fingers and hope nothing triggers enforcement. None of
              these scale to the actual cadence at which content gets published.
            </p>
            <p className="text-base sm:text-[17px] text-white/80 leading-relaxed">
              Meanwhile FDA warning letters hit a 25-year high in 2024. FTC
              enforcement on healthcare advertising has accelerated.
              Platform policies (Meta, Google, TikTok) have tightened. State
              AGs and state medical boards have become more active on
              consumer-facing healthcare marketing. The marketing volume is
              going up; the regulatory surface is tightening.
            </p>
            <p className="text-base sm:text-[17px] text-white/80 leading-relaxed">
              What didn&rsquo;t exist: software purpose-built to catch the
              specific patterns that generate enforcement, updated daily as
              new enforcement publishes, priced at a rate that makes
              pre-publish review on every post economically feasible, with
              documented audit trails suitable for regulatory response. So we
              built it.
            </p>
          </div>
        </div>
      </section>

      {/* ============ PRINCIPLES ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              What we stand for
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Principles that shape the product
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {PRINCIPLES.map((p) => {
              const Icon = p.icon
              return (
                <div
                  key={p.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7 hover:border-[#55E039]/25 hover:bg-white/[0.06] transition-all"
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

      {/* ============ COMPANY CONTEXT ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-[#55E039]/25 bg-gradient-to-br from-[#55E039]/[0.06] via-[#0a0a0a] to-[#0a0a0a] p-8 sm:p-10 overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#55E039]/[0.08] blur-[80px] rounded-full pointer-events-none" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#55E039] mb-3">
                Company
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-5">
                Operated by Dibb Media
              </h2>
              <p className="text-base sm:text-[17px] text-white/85 leading-relaxed mb-4">
                RegenCompliance is built and operated by Dibb Media, an
                independent software company focused on vertical SaaS for
                specific industries. We ship small focused products that
                solve specific problems well, rather than horizontal
                platforms that try to be everything.
              </p>
              <p className="text-base sm:text-[17px] text-white/85 leading-relaxed">
                Based in the US. Independently owned. Funded by customers,
                not venture capital &mdash; which means we&rsquo;re optimizing
                for a product our customers want to use long-term, not a
                growth story that makes an exit work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTACT ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#55E039]/10 border border-[#55E039]/20 mb-5">
            <Mail className="h-6 w-6 text-[#55E039]" aria-hidden />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Get in touch
          </h2>
          <p className="mt-5 text-base text-white/70 max-w-md mx-auto leading-relaxed">
            Questions about the product, compliance philosophy, partnership
            opportunities, or healthcare marketing generally. We read every
            email.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3">
            <a
              href="mailto:support@regencompliance.com"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-8 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all"
            >
              Email the team
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/demo"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#55E039]/25 bg-[#55E039]/[0.04] px-8 text-[15px] font-semibold text-[#55E039] hover:bg-[#55E039]/[0.08] transition-all"
            >
              Try the free demo
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
