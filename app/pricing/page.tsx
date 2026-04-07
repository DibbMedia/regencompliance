"use client"

import Link from "next/link"
import { BetaCheckoutButton, BetaSpotsCounter } from "@/components/beta-checkout-button"
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  X,
  Scan,
  Pencil,
  BookOpen,
  Bell,
  Clock,
  Users,
  Lock,
  AlertTriangle,
  DollarSign,
  ChevronDown,
  Scale,
  TrendingDown,
  Zap,
} from "lucide-react"
import { useState } from "react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"

const includedFeatures = [
  { icon: Scan, title: "Unlimited Compliance Scans", desc: "Scan any content — website pages, ads, emails, social posts, scripts — as many times as you need, no limits." },
  { icon: Pencil, title: "AI-Powered Compliant Rewrites", desc: "One-click rewriting of flagged content into compliant alternatives that preserve your clinic's voice and messaging." },
  { icon: BookOpen, title: "Full Compliance Library (300+ Rules)", desc: "Searchable database of banned phrases, compliant alternatives, risk ratings, and source citations from real enforcement actions." },
  { icon: Bell, title: "Daily FDA/FTC Rule Updates", desc: "Automated monitoring adds new violations to your ruleset within 24 hours of enforcement. Always current, never outdated." },
  { icon: Clock, title: "Complete Audit Trail + PDF Export", desc: "Every scan permanently logged with timestamps, scores, and full reports. Export PDF or CSV for legal documentation." },
  { icon: Users, title: "3 Team Seats Included", desc: "Give access to your marketing manager, content writer, and clinic owner — shared history under one account." },
  { icon: Lock, title: "Zero Patient Data Exposure", desc: "We analyze marketing text only. No PHI, no patient records, no clinical data. Zero HIPAA implications whatsoever." },
  { icon: ShieldCheck, title: "Real-Time Enforcement Alerts", desc: "Get notified when significant new FDA or FTC enforcement actions impact regenerative medicine marketing rules." },
]

const comparisonRows = [
  { feature: "FDA/FTC compliance scanning", us: true, attorney: true, diy: false },
  { feature: "Regen-medicine-specific rules", us: true, attorney: "Varies", diy: false },
  { feature: "AI-powered compliant rewrites", us: true, attorney: false, diy: false },
  { feature: "300+ active compliance rules", us: true, attorney: false, diy: false },
  { feature: "Daily rule updates", us: true, attorney: false, diy: false },
  { feature: "Audit trail & PDF export", us: true, attorney: false, diy: false },
  { feature: "Instant results (under 30 seconds)", us: true, attorney: false, diy: false },
  { feature: "Available 24/7", us: true, attorney: false, diy: true },
  { feature: "Monthly cost", us: "$297 (beta) / $497", attorney: "$2,000-$10,000", diy: "$0" },
  { feature: "Risk of missed violations", us: "Very Low", attorney: "Low", diy: "Very High" },
]

const pricingFaqs = [
  { q: "Is there a contract or commitment?", a: "No. RegenCompliance is month-to-month. You can cancel at any time from your account settings with one click. No cancellation fees, no penalty, no questions asked. Your access continues through the end of your current billing period." },
  { q: "Can I try it before I buy?", a: "Yes. We offer a free demo scanner on our website that lets you paste in sample content and see a compliance report. The demo uses a subset of our full ruleset, but it gives you a clear picture of how the scanner works and the quality of the analysis." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) through Stripe, our payment processor. All transactions are secured with bank-level encryption." },
  { q: "Do you offer discounts for multiple clinics?", a: "We are building multi-location support. If you operate multiple clinic locations, contact us to discuss volume pricing. Each subscription covers one clinic account with 3 team seats." },
  { q: "What happens to my data if I cancel?", a: "Your scan history and audit trail remain accessible for 30 days after cancellation. You can export all reports as PDF or CSV before your account is deactivated. After 30 days, data is permanently deleted per our privacy policy." },
  { q: "Is the $497/month tax deductible?", a: "In most cases, yes. RegenCompliance is a business software expense for regulatory compliance. Consult your accountant, but compliance software is typically a deductible business expense under IRS guidelines." },
  { q: "How does the money-back guarantee work?", a: "If you are not satisfied within your first 30 days, contact us for a full refund. No fine print. We want you to use the tool enough to see the value — if you do not find it valuable after running scans on your actual content, we will refund every penny." },
]

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <MarketingBg />
      <MarketingHeader />

      {/* ============ HERO ============ */}
      <section className="relative pt-32 pb-16">
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">BETA LAUNCH — LIMITED SPOTS</p>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.1]">
            Lock in $297/mo for life.
            <br />
            <span className="bg-gradient-to-r from-[#55E039] to-[#89E3E4] bg-clip-text text-transparent">Rate never increases.</span>
          </h1>
          <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-2xl mx-auto">
            We are opening 25 founding member spots at $297/mo — locked in for life. Once they are gone, the only option is $497/mo.
          </p>
        </div>
      </section>

      {/* ============ PRICING CARDS ============ */}
      <section className="relative pb-16">
        <div className="relative mx-auto max-w-5xl px-6 grid gap-8 md:grid-cols-2 items-start">
          {/* BETA PLAN — PRIMARY */}
          <div className="rounded-2xl bg-white/[0.03] border-2 border-[#55E039]/40 p-10 relative overflow-hidden shadow-xl shadow-[#55E039]/[0.08]">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#55E039]/70 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-24 bg-[#55E039]/[0.08] blur-[50px]" />
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#55E039]/15 border border-[#55E039]/25 px-3 py-1 text-xs font-bold text-[#55E039]">
                <Zap className="h-3 w-3" />
                Beta — Limited Spots
              </span>
            </div>
            <p className="text-sm font-extrabold text-[#55E039]/70 mb-2">Founding Member</p>
            <div className="flex items-baseline gap-1 mb-1">
              <p className="text-6xl font-extrabold tracking-tight text-white">$297</p>
              <span className="text-lg font-normal text-white/40">/mo</span>
            </div>
            <p className="text-sm text-[#55E039]/80 font-semibold mb-2">Locked-In Rate — Never increases</p>
            <BetaSpotsCounter className="inline-block text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 mb-8" />
            <BetaCheckoutButton className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:brightness-110 transition-all cursor-pointer mb-6">
              Claim Beta Access — $297/mo
              <ArrowRight className="h-4 w-4" />
            </BetaCheckoutButton>
            <p className="text-center text-xs text-white/40 mb-8">Save $200/mo vs standard pricing. Rate locked for life.</p>
            <div className="pt-6 border-t border-white/[0.06]">
              <p className="text-sm font-extrabold text-white mb-4">Everything included, forever:</p>
              <ul className="space-y-3">
                {includedFeatures.map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#55E039] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[15px] text-white/70 font-medium">{item.title}</span>
                      <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#55E039] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[15px] text-white font-semibold">Rate locked at $297/mo — never increases</span>
                    <p className="text-xs text-white/40 mt-0.5 leading-relaxed">Your rate stays at $297/mo for life. All future updates and features included.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* STANDARD PLAN — COMING SOON */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-10 relative overflow-hidden opacity-70">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] border border-white/10 px-3 py-1 text-xs font-bold text-white/40">
                Coming Soon
              </span>
            </div>
            <p className="text-sm font-extrabold text-white/40 mb-2">Professional</p>
            <div className="flex items-baseline gap-1 mb-1">
              <p className="text-6xl font-extrabold tracking-tight text-white/40">$497</p>
              <span className="text-xl font-normal text-white/30">/mo</span>
            </div>
            <p className="text-sm text-white/30 mb-8">Available after beta period ends.</p>
            <div className="flex h-13 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] text-[15px] font-bold text-white/30 cursor-not-allowed select-none mb-6">
              Coming Soon
            </div>
            <p className="text-center text-xs text-white/20 mb-8">Lock in $297/mo now — saves $200/mo when standard launches.</p>
            <div className="pt-6 border-t border-white/[0.06]">
              <p className="text-sm font-extrabold text-white/30 mb-4">Everything included:</p>
              <ul className="space-y-3">
                {includedFeatures.map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-white/20 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[15px] text-white/30 font-medium">{item.title}</span>
                      <p className="text-xs text-white/20 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ROI CALCULATOR ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">THE MATH</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">The cost of not scanning.</h2>
            <p className="mt-4 text-base text-white/60 max-w-2xl mx-auto">
              One FDA warning letter triggers a cascade of expenses that makes $497 per month look like a rounding error.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Cost of non-compliance */}
            <div className="rounded-2xl bg-red-500/[0.03] border border-red-500/20 p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <h3 className="text-lg font-extrabold text-white">Without RegenCompliance</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-sm text-white/60">FDA warning letter legal response</span>
                  <span className="text-sm font-bold text-red-400">$50,000 - $150,000</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-sm text-white/60">FTC consent decree compliance</span>
                  <span className="text-sm font-bold text-red-400">$100,000 - $500,000</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-sm text-white/60">Website takedown + rebuilding</span>
                  <span className="text-sm font-bold text-red-400">$15,000 - $40,000</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-sm text-white/60">Lost revenue during remediation</span>
                  <span className="text-sm font-bold text-red-400">$50,000 - $200,000</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-sm text-white/60">Reputation damage (est. patient loss)</span>
                  <span className="text-sm font-bold text-red-400">Incalculable</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-extrabold text-white">Potential total exposure</span>
                  <span className="text-lg font-extrabold text-red-400">$215,000 - $890,000</span>
                </div>
              </div>
            </div>
            {/* Cost of RegenCompliance */}
            <div className="rounded-2xl bg-[#55E039]/[0.03] border border-[#55E039]/20 p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-[#55E039]/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-[#55E039]" />
                </div>
                <h3 className="text-lg font-extrabold text-white">With RegenCompliance</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-sm text-white/60">Monthly subscription</span>
                  <span className="text-sm font-bold text-[#55E039]">$497/mo</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-sm text-white/60">Annual cost</span>
                  <span className="text-sm font-bold text-[#55E039]">$5,964/yr</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-sm text-white/60">Setup fees</span>
                  <span className="text-sm font-bold text-[#55E039]">$0</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-sm text-white/60">Hidden costs</span>
                  <span className="text-sm font-bold text-[#55E039]">$0</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-sm text-white/60">Compliance documentation</span>
                  <span className="text-sm font-bold text-[#55E039]">Included</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-extrabold text-white">Total annual investment</span>
                  <span className="text-lg font-extrabold text-[#55E039]">$5,964</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 max-w-4xl mx-auto">
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-7 hover:bg-white/[0.06] transition-all duration-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <TrendingDown className="h-6 w-6 text-[#55E039]" />
                <h3 className="text-xl font-extrabold text-white">The Bottom Line</h3>
              </div>
              <p className="text-base text-white/70 leading-relaxed max-w-2xl mx-auto">
                A single FDA warning letter costs more in legal fees than <span className="text-white font-extrabold">14 years</span> of RegenCompliance at beta pricing. Even if you only consider the attorney time to respond to a warning letter — typically $50,000 to $150,000 — the math is clear. At $297/mo, that is $3,564 per year. RegenCompliance does not just pay for itself. It pays for itself many times over. The clinics that get warning letters are not doing anything your clinic is not also doing. They are using the same language, making the same claims, running the same ads. The only difference is they got noticed first.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ COMPARISON TABLE ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">COMPARE</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">How we stack up.</h2>
            <p className="mt-4 text-base text-white/60">RegenCompliance vs. hiring a healthcare attorney vs. doing it yourself.</p>
          </div>
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-sm font-extrabold p-4 text-white/70">Feature</th>
                    <th className="text-center text-sm font-extrabold p-4">
                      <span className="text-[#55E039]">RegenCompliance</span>
                    </th>
                    <th className="text-center text-sm font-extrabold p-4 text-white/70">Healthcare Attorney</th>
                    <th className="text-center text-sm font-extrabold p-4 text-white/70">DIY / Google</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={i} className={i < comparisonRows.length - 1 ? "border-b border-white/[0.06]" : ""}>
                      <td className="text-sm text-white/60 p-4">{row.feature}</td>
                      <td className="text-center p-4">
                        {row.us === true ? (
                          <CheckCircle2 className="h-5 w-5 text-[#55E039] mx-auto" />
                        ) : typeof row.us === "string" ? (
                          <span className="text-sm font-bold text-[#55E039]">{row.us}</span>
                        ) : (
                          <X className="h-5 w-5 text-white/20 mx-auto" />
                        )}
                      </td>
                      <td className="text-center p-4">
                        {row.attorney === true ? (
                          <CheckCircle2 className="h-5 w-5 text-white/40 mx-auto" />
                        ) : row.attorney === false ? (
                          <X className="h-5 w-5 text-white/20 mx-auto" />
                        ) : (
                          <span className="text-sm text-white/40">{row.attorney}</span>
                        )}
                      </td>
                      <td className="text-center p-4">
                        {row.diy === true ? (
                          <CheckCircle2 className="h-5 w-5 text-white/40 mx-auto" />
                        ) : row.diy === false ? (
                          <X className="h-5 w-5 text-white/20 mx-auto" />
                        ) : (
                          <span className="text-sm text-white/40">{row.diy}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ============ GUARANTEE ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-10 text-center relative overflow-hidden hover:bg-white/[0.06] transition-all duration-300">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#55E039]/30 to-transparent" />
            <div className="h-16 w-16 rounded-2xl bg-[#55E039]/10 border border-[#55E039]/15 flex items-center justify-center mx-auto mb-6">
              <Scale className="h-8 w-8 text-[#55E039]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-4">30-Day Money-Back Guarantee</h2>
            <p className="text-base text-white/70 leading-relaxed mb-6 max-w-xl mx-auto">
              We are confident that once you scan your actual marketing content, you will find violations you did not know you had. If you sign up, run scans on your content, and do not find the tool valuable within 30 days, we will refund your payment in full. No forms to fill out, no hoops to jump through, no retention scripts. Just email us and the refund is processed.
            </p>
            <p className="text-sm text-white/40 leading-relaxed max-w-lg mx-auto">
              We can offer this guarantee because the data speaks for itself. The average first scan on a regenerative medicine clinic&apos;s website finds 12 to 25 compliance violations. Most clinic owners are shocked at how much risk is sitting on their homepage right now. We want you to experience that moment yourself, risk-free.
            </p>
          </div>
        </div>
      </section>

      {/* ============ PRICING FAQ ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-2xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Pricing questions</h2>
            <p className="mt-4 text-base text-white/60">Everything you need to know about billing and your subscription.</p>
          </div>
          <div className="space-y-3">
            {pricingFaqs.map((faq, i) => (
              <button
                key={i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className={`w-full text-left rounded-2xl bg-white/[0.03] border px-6 py-5 transition-all duration-300 ${openFaq === i ? "border-[#55E039]/20 bg-white/[0.06]" : "border-white/10 hover:bg-white/[0.06]"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-extrabold text-white pr-4">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-white/40 shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                </div>
                {openFaq === i && (
                  <p className="mt-4 text-sm text-white/60 leading-relaxed">{faq.a}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">GET STARTED</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Protect your clinic today.
          </h2>
          <p className="mt-5 text-base text-white/60 max-w-md mx-auto leading-relaxed">
            Lock in $297/mo before the 25 beta spots run out. After that, it goes to $497/mo — no exceptions.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <BetaCheckoutButton className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-8 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:brightness-110 transition-all cursor-pointer">
              Claim Beta Access — $297/mo
              <ArrowRight className="h-4 w-4" />
            </BetaCheckoutButton>
            <Link href="/demo" className="inline-flex h-12 items-center rounded-xl border border-[#55E039]/20 bg-[#55E039]/[0.04] px-8 text-[15px] font-bold text-[#55E039] shadow-[0_0_20px_rgba(85,224,57,0.08)] hover:bg-[#55E039]/[0.08] transition-all">
              Try Demo First
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
