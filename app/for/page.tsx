import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Users, Sparkles, Building2 } from "lucide-react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import { SPECIALTIES } from "@/lib/specialty/registry"

const canonical = "https://compliance.regenportal.com/for"

const SPECIALTY_HUB_FAQS = [
  {
    q: "Why does specialty-specific compliance matter?",
    a: "Because enforcement is specialty-specific. The FDA's med spa warning letters focus on different claim patterns than its regen medicine letters. FTC weight-loss enforcement has different typical-experience rules (from Jenny Craig precedent) than general aesthetic enforcement. State medical boards apply different specialty-claim rules to dental, plastic surgery, and general medicine. A single-rule-set tool that averages across all healthcare misses the specific patterns your specialty actually faces.",
  },
  {
    q: "What if my specialty isn't listed?",
    a: "The core FDA and FTC rules apply to every healthcare specialty - so the scanner still catches disease claims, testimonial-disclosure issues, and guarantee language regardless of specialty. Specialty-specific pages cover the claim categories unique to each area. Additional specialties are added as the rule set grows - functional medicine, hormone therapy, chiropractic, dermatology, and hair restoration are on the expansion list.",
  },
  {
    q: "Can one practice use multiple specialty rule sets?",
    a: "Yes. Practices that span specialties (e.g., a med spa that also offers weight loss programs) automatically get both rule sets applied. The scanner doesn't force you to pick one specialty - it applies every relevant rule based on content.",
  },
  {
    q: "Do DSOs and multi-location groups use these pages?",
    a: "Yes. Corporate compliance teams at DSOs, med spa franchises, and multi-location groups use specialty pages to calibrate their internal review processes, train new marketing staff, and audit per-location marketing for specialty-specific patterns.",
  },
  {
    q: "How often are specialty rules updated?",
    a: "The underlying rule set updates daily as new FDA warning letters and FTC enforcement actions are published. Specialty-specific pages are reviewed quarterly for major updates when enforcement patterns shift (e.g., the 2024-2026 GLP-1 enforcement wave materially changed weight-loss clinic rules).",
  },
  {
    q: "Does this replace my marketing agency or in-house team?",
    a: "No. We handle the compliance gate between their output and your publishing. If your agency writes, runs ads, or handles content strategy, they continue doing that work. Several healthcare-specialty marketing agencies actually use RegenCompliance internally to check their own deliverables before sending to clinic clients.",
  },
]

export const metadata: Metadata = {
  title: "Compliance Software by Specialty - Med Spa, Regen, Weight Loss, Dental & More",
  description:
    "RegenCompliance specializes by specialty. Purpose-built compliance scanning for med spas, weight loss clinics, regen medicine, dental, IV therapy, and aesthetic practices - each with specialty-specific rule sets.",
  keywords: [
    "healthcare specialty compliance software",
    "med spa compliance",
    "weight loss clinic compliance",
    "regenerative medicine compliance",
    "dental marketing compliance",
    "IV therapy compliance",
    "aesthetic practice compliance",
  ],
  alternates: { canonical },
  openGraph: {
    title: "Compliance Software by Healthcare Specialty - RegenCompliance",
    description:
      "Purpose-built compliance scanning by specialty. Each rule set reflects the enforcement actually targeting your practice type.",
    url: canonical,
    type: "website",
  },
}

export default function SpecialtiesIndexPage() {
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
        name: "For specialties",
        item: canonical,
      },
    ],
  }

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: SPECIALTIES.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://compliance.regenportal.com/for/${s.slug}`,
      name: `Compliance software for ${s.specialty}`,
    })),
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SPECIALTY_HUB_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <MarketingBg />
      <MarketingHeader />

      {/* ============ HERO ============ */}
      <section className="relative pt-32 pb-14 sm:pt-36">
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#55E039]/25 bg-[#55E039]/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#55E039] mb-6">
            <Sparkles className="h-3 w-3" />
            Built for your specialty
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08]">
            Specialty-specific compliance -{" "}
            <span className="bg-gradient-to-r from-[#55E039] to-[#89E3E4] bg-clip-text text-transparent">
              not generic healthcare rules
            </span>
          </h1>
          <p className="mt-6 text-lg text-white/75 leading-relaxed max-w-2xl mx-auto">
            Every healthcare specialty has its own enforcement surface. Med spas, weight
            loss clinics, and regen practices face different FDA patterns, different FTC
            rules, and different state medical board scrutiny. One rule set for all of
            healthcare cannot model that - so we built one per specialty.
          </p>
        </div>
      </section>

      {/* ============ SPECIALTY CARDS ============ */}
      <section className="relative py-8">
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {SPECIALTIES.map((s) => (
              <Link
                key={s.slug}
                href={`/for/${s.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 hover:border-[#55E039]/25 hover:bg-white/[0.06] transition-all"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-[#55E039]/10 border border-[#55E039]/15 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-[#55E039]" aria-hidden />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#55E039]/80">
                    For
                  </p>
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight text-white leading-tight group-hover:text-[#55E039] transition-colors">
                  {s.specialty}
                </h2>
                <p className="mt-3 text-sm text-white/70 leading-relaxed line-clamp-4">
                  {s.heroTagline}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#55E039]">
                  See specialty rule set
                  <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHY SPECIALTY MATTERS ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-[#55E039]/25 bg-gradient-to-br from-[#55E039]/[0.06] via-[#0a0a0a] to-[#0a0a0a] p-8 sm:p-10 overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#55E039]/[0.08] blur-[80px] rounded-full pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-[#55E039]" aria-hidden />
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Why specialty matters
                </h2>
              </div>
              <p className="text-base sm:text-[17px] text-white/80 leading-relaxed mb-4">
                Most compliance tools model 'healthcare' as a single category. That
                approximation misses the specialty-specific enforcement that drives real
                warning letters. A med spa marketing Botox faces completely different
                rules than a regen clinic marketing PRP, which faces completely different
                rules than a weight-loss clinic marketing GLP-1s.
              </p>
              <p className="text-base sm:text-[17px] text-white/80 leading-relaxed">
                RegenCompliance is organized the same way regulators think about
                enforcement - by specialty, by claim category, by device or drug
                classification. That specificity is what catches the violations generic
                tools miss.
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
              Specialty questions
            </h2>
          </div>
          <div className="space-y-3">
            {SPECIALTY_HUB_FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7"
              >
                <h3 className="text-[15px] sm:text-base font-semibold text-white mb-3">
                  {faq.q}
                </h3>
                <p className="text-sm sm:text-[15px] text-white/70 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative py-14">
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Don't see your specialty?
          </h2>
          <p className="mt-4 text-base text-white/70 max-w-md mx-auto leading-relaxed">
            The rule set expands regularly. If your specialty isn't listed, the core
            rules still apply - and new specialty pages go live as the rule set grows.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              href="/demo"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-6 sm:px-8 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all"
            >
              Try the Free Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/features"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#55E039]/25 bg-[#55E039]/[0.04] px-6 sm:px-8 text-[15px] font-semibold text-[#55E039] hover:bg-[#55E039]/[0.08] transition-all"
            >
              See all features
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
