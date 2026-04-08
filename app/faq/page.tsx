"use client"

import Link from "next/link"
import { CheckoutButton } from "@/components/checkout-button"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import {
  ArrowRight,
  ChevronDown,
  HelpCircle,
  Info,
  Scale,
  Scan,
  CreditCard,
  Lock,
} from "lucide-react"
import { useState } from "react"

interface FaqItem {
  q: string
  a: string
}

interface FaqCategory {
  title: string
  icon: React.ElementType
  faqs: FaqItem[]
}

const faqCategories: FaqCategory[] = [
  {
    title: "General",
    icon: Info,
    faqs: [
      {
        q: "What is RegenCompliance?",
        a: "RegenCompliance is a specialized FDA/FTC compliance scanning platform built exclusively for regenerative medicine clinics. It analyzes your marketing content — website copy, social media posts, ads, emails, scripts, and more — against a database of over 300 compliance rules derived from real FDA warning letters and FTC enforcement actions. The platform flags non-compliant language and generates compliant alternative wording with a single click.",
      },
      {
        q: "Who is RegenCompliance designed for?",
        a: "RegenCompliance is built specifically for regenerative medicine clinics offering treatments such as PRP (platelet-rich plasma), stem cell therapy, exosomes, BMAC (bone marrow aspirate concentrate), Wharton's jelly, prolotherapy, and peptide therapy. It is used by clinic owners, marketing managers, content writers, and front desk staff who create or review patient-facing marketing content. If your clinic offers any regenerative or biologic treatment and you produce marketing materials, RegenCompliance is built for you.",
      },
      {
        q: "Is RegenCompliance a replacement for legal counsel?",
        a: "No. RegenCompliance is an educational compliance tool, not a law firm. It helps you identify and fix the most common compliance violations in your marketing content based on real enforcement data, but it does not constitute legal advice. We strongly recommend that all final marketing content be reviewed by qualified healthcare marketing counsel. Think of RegenCompliance as your first line of defense — it catches the violations before they reach your attorney, saving you significant legal review costs while reducing your regulatory exposure.",
      },
      {
        q: "How is this different from a generic AI writing tool?",
        a: "Generic AI tools like ChatGPT have no awareness of FDA or FTC regulations specific to regenerative medicine. They will happily write marketing copy that includes drug claims, unapproved efficacy statements, and misleading testimonials — all of which violate federal law. RegenCompliance is purpose-built with a ruleset derived from actual enforcement actions against regen clinics. It knows that 'FDA-approved stem cells' is a false claim, that 'cures arthritis' is an unapproved drug claim, and that 'reverses aging' triggers FTC scrutiny. No generic tool has this specialized knowledge.",
      },
    ],
  },
  {
    title: "Compliance & Regulations",
    icon: Scale,
    faqs: [
      {
        q: "What types of compliance violations does the scanner detect?",
        a: "The scanner detects a wide range of FDA and FTC violations common in regenerative medicine marketing. This includes unapproved drug claims (e.g., 'heals,' 'cures,' 'treats'), false FDA status claims (e.g., 'FDA-approved stem cells'), misleading efficacy claims (e.g., 'proven to reverse aging'), improper testimonial use (patient stories that imply guaranteed outcomes), comparative claims without substantiation (e.g., 'better than surgery'), and structure/function claims that cross into drug claim territory. Each flagged violation includes the specific regulatory basis — whether from an FDA warning letter, FTC enforcement action, or CBER guidance document.",
      },
      {
        q: "How current is the compliance database?",
        a: "The database is updated daily. Our system monitors FDA.gov for new warning letters, FTC.gov for enforcement actions and press releases, and state medical board websites for updated advertising guidance every morning. When a new enforcement action is relevant to regenerative medicine marketing, the specific language violations are extracted and added to the compliance database within 24 hours. This means you are always scanning against the most current regulatory landscape available, not a static ruleset that was compiled months ago.",
      },
      {
        q: "Does RegenCompliance cover state-level regulations?",
        a: "Our primary focus is federal FDA and FTC regulations, as these carry the highest enforcement risk and apply nationwide. However, we also incorporate guidance from state medical boards where they have published specific advertising rules for regenerative medicine. State-level rules vary significantly, and we continue to expand our state coverage. If your state has specific advertising regulations for regenerative treatments that are not yet in our database, contact us and we will prioritize adding them.",
      },
      {
        q: "What is the difference between a drug claim and a structure/function claim?",
        a: "This is one of the most critical distinctions in regenerative medicine marketing. A drug claim states or implies that a treatment can diagnose, cure, mitigate, treat, or prevent a disease (e.g., 'stem cell therapy cures knee arthritis'). Drug claims require FDA approval. A structure/function claim describes how a treatment affects the normal structure or function of the body (e.g., 'may support the body's natural joint function'). Structure/function claims carry significantly less regulatory risk. RegenCompliance flags drug claims and suggests compliant structure/function alternatives. This distinction is nuanced, and our scanner has been trained on hundreds of real-world examples to get it right.",
      },
    ],
  },
  {
    title: "Scanner & Features",
    icon: Scan,
    faqs: [
      {
        q: "What types of content can I scan?",
        a: "You can scan any text-based marketing content. This includes website copy and landing pages, social media posts and captions, Google Ads and Meta Ads copy, patient email campaigns and newsletters, sales scripts and phone scripts, blog posts and educational articles, brochure and print material text, video scripts and podcast talking points, patient intake forms and consent language (marketing portions), and any other patient-facing text your clinic produces. Simply paste the text into the scanner and click scan.",
      },
      {
        q: "How does the AI Rewriter work?",
        a: "When the scanner flags a violation, the AI Rewriter generates compliant alternative language with one click. The rewriter is specifically trained on FDA/FTC enforcement language and compliant marketing examples from regenerative medicine practices. It preserves your clinic's voice and messaging while removing regulatory risk. Each rewrite includes an explanation of why the original language was problematic and what compliance principle the new language satisfies. You can accept the rewrite as-is, manually edit it, or request a different alternative. Over time, your team learns the compliance reasoning behind each change.",
      },
      {
        q: "Is there a limit on how many scans I can run?",
        a: "No. Your subscription includes unlimited compliance scans. Scan every page of your website, every social media post before it goes live, every email before it sends, every ad before it runs. There is no per-scan fee, no monthly cap, and no throttling. We want you to scan everything, because every piece of content you scan is one less regulatory risk sitting on your marketing channels.",
      },
      {
        q: "How long does a scan take?",
        a: "Most scans complete in under 30 seconds. The scanner analyzes your content at the sentence level, cross-referencing each statement against the full compliance database. Longer content (such as full web pages with thousands of words) may take slightly longer, but results are typically delivered within a minute. The speed makes it practical to scan content during your regular workflow rather than batching it for a weekly review.",
      },
    ],
  },
  {
    title: "Billing & Account",
    icon: CreditCard,
    faqs: [
      {
        q: "How much does RegenCompliance cost?",
        a: "RegenCompliance is $497 per month. This is a single plan that includes every feature — unlimited scans, AI-powered rewrites, the full compliance library with 300+ rules, daily rule updates, complete audit trail with PDF/CSV export, real-time enforcement alerts, and 3 team seats. There are no tiers, no hidden fees, no add-ons, and no per-scan charges. The price is the same for every clinic regardless of size or scan volume.",
      },
      {
        q: "Is there a contract or long-term commitment?",
        a: "No. RegenCompliance is billed month-to-month. You can cancel at any time from your account settings with one click. There are no cancellation fees, no early termination penalties, and no questions asked. When you cancel, your access continues through the end of your current billing period. You can resubscribe at any time if you decide to come back.",
      },
      {
        q: "Do you offer a free trial or money-back guarantee?",
        a: "We offer a free demo scanner on our website that lets you paste in content and see a compliance report using a subset of our ruleset. For full access, we offer a 30-day money-back guarantee instead of a free trial. Sign up, scan your actual content, and if you do not find the tool valuable within 30 days, contact us for a full refund. We prefer this approach because a time-limited trial creates pressure to evaluate quickly, while the money-back guarantee lets you take your time and scan real content without risk.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards including Visa, Mastercard, American Express, and Discover. Payments are processed through Stripe with bank-level encryption. We do not store your payment details on our servers — Stripe handles all payment processing securely. You will receive an email receipt for each monthly payment, and you can view your full billing history in your account settings.",
      },
    ],
  },
  {
    title: "Security & Privacy",
    icon: Lock,
    faqs: [
      {
        q: "Does RegenCompliance access any patient data?",
        a: "Never. RegenCompliance analyzes marketing text only. We do not access patient records, medical charts, treatment histories, or any form of protected health information (PHI). The system has zero connection to your EMR, practice management software, or patient databases. You paste marketing content into the scanner — that is the only data we process. There are zero HIPAA implications because we never handle PHI in any form.",
      },
      {
        q: "Is my scanned content stored? Who can see it?",
        a: "Yes, scanned content is stored as part of your audit trail. This is a feature, not a risk — it gives you documented proof that you reviewed your content for compliance. Your scanned content is encrypted at rest and in transit. Only authenticated users on your account (your team seats) can access your scan history. We do not share, sell, or use your content for any purpose other than providing the compliance scanning service. Our employees cannot access your scan content without explicit authorization during a support request.",
      },
      {
        q: "Where is my data hosted?",
        a: "RegenCompliance is hosted on enterprise-grade cloud infrastructure with SOC 2 Type II compliant data centers in the United States. All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. We perform regular security audits and maintain strict access controls. Your compliance data never leaves US-based servers, and we do not use third-party analytics tools that would expose your content to external parties.",
      },
    ],
  },
]

const ALL_FILTER = "All"

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  const [activeCategory, setActiveCategory] = useState<string>(ALL_FILTER)

  function toggleItem(key: string) {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const categories = [ALL_FILTER, ...faqCategories.map((c) => c.title)]
  const visibleCategories =
    activeCategory === ALL_FILTER
      ? faqCategories
      : faqCategories.filter((c) => c.title === activeCategory)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <MarketingBg />
      <MarketingHeader />

      {/* Hero */}
      <section className="relative pt-32 pb-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">FAQ</p>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.1]">
            Everything you need
            <br />
            <span className="bg-gradient-to-r from-[#55E039] to-[#89E3E4] bg-clip-text text-transparent">to know.</span>
          </h1>
          <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-2xl mx-auto">
            Detailed answers to the most common questions about RegenCompliance, our compliance scanner, billing, security, and how the platform works for your clinic.
          </p>
        </div>
      </section>

      {/* Category filter pills */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => {
              const catData = faqCategories.find((c) => c.title === cat)
              const Icon = catData?.icon
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`inline-flex items-center gap-2 rounded-full text-xs sm:text-sm px-3 py-1.5 sm:px-5 sm:py-2.5 font-medium transition-all duration-300 ${
                    activeCategory === cat
                      ? "bg-[#55E039]/10 border border-[#55E039]/20 text-[#55E039]"
                      : "bg-white/[0.03] border border-white/10 text-white/60 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="relative py-16">
        <div className="mx-auto max-w-3xl px-6">
          {visibleCategories.map((category) => (
            <div key={category.title} className="mb-12 last:mb-0">
              {/* Section heading */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-[#55E039]/10 border border-[#55E039]/20 flex items-center justify-center">
                  <category.icon className="h-5 w-5 text-[#55E039]" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">{category.title}</h2>
                  <p className="text-sm text-white/40">{category.faqs.length} questions</p>
                </div>
              </div>

              {/* Accordion cards */}
              <div className="space-y-3">
                {category.faqs.map((faq, i) => {
                  const key = `${category.title}-${i}`
                  const isOpen = openItems[key] || false
                  return (
                    <button
                      key={key}
                      onClick={() => toggleItem(key)}
                      className={`w-full text-left rounded-2xl bg-white/[0.03] border px-6 py-5 transition-all duration-300 ${
                        isOpen
                          ? "border-[#55E039]/20 bg-white/[0.06]"
                          : "border-white/10 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[15px] font-semibold text-white pr-4">{faq.q}</span>
                        <ChevronDown
                          className={`h-4 w-4 text-white/40 shrink-0 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      {isOpen && (
                        <p className="mt-4 text-sm text-white/60 leading-relaxed">{faq.a}</p>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still have questions? */}
      <section className="relative py-16">
        <div className="mx-auto max-w-2xl px-6">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-10 text-center">
            <div className="h-12 w-12 rounded-xl bg-[#55E039]/10 border border-[#55E039]/20 flex items-center justify-center mx-auto mb-5">
              <HelpCircle className="h-6 w-6 text-[#55E039]" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight mb-3">Still have questions?</h2>
            <p className="text-base text-white/60 leading-relaxed mb-8 max-w-md mx-auto">
              We are happy to answer anything that is not covered here. Reach out and we will get back to you within one business day.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:support@regencompliance.com"
                className="inline-flex h-12 items-center rounded-xl border border-[#55E039]/30 px-8 text-[15px] font-medium text-[#55E039] hover:bg-[#55E039]/5 transition-all shadow-[0_0_20px_rgba(85,224,57,0.08)]"
              >
                Email Support
              </a>
              <CheckoutButton className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-8 text-[15px] font-semibold text-[#0a0a0a] shadow-lg shadow-[#55E039]/25 hover:shadow-xl hover:shadow-[#55E039]/40 hover:brightness-110 transition-all cursor-pointer">
                Get Started — $497/mo
                <ArrowRight className="h-4 w-4" />
              </CheckoutButton>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
