import Link from "next/link"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"

export const metadata = {
  title: "Accessibility Statement - RegenCompliance",
  description: "Accessibility Statement for RegenCompliance, the FDA/FTC compliance scanner for healthcare practices.",
}

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <MarketingBg />
      <MarketingHeader />

      {/* Hero */}
      <section className="relative pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">LEGAL</p>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.1]">
            Accessibility Statement
          </h1>
          <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-2xl">
            The full Accessibility Statement is being finalized with our legal counsel.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-5 sm:p-8 lg:p-12">
            <h2 className="text-xl font-extrabold tracking-tight text-white mb-4">
              Coming soon
            </h2>
            <p className="text-[15px] text-white/75 leading-relaxed">
              The updated Accessibility Statement for RegenCompliance, operated by Regen Portal LLC, is being finalized with our legal counsel and will be posted here shortly. For questions in the meantime, please use our{" "}
              <Link href="/contact" className="text-[#55E039] hover:underline">
                contact form
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
