import Link from "next/link"
import { Shield, ArrowRight, Search, FileQuestion } from "lucide-react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"

const SUGGESTIONS = [
  {
    href: "/demo",
    title: "Try the free demo",
    desc: "Scan any marketing content for FDA/FTC compliance issues, no signup required.",
  },
  {
    href: "/blog",
    title: "Read the compliance blog",
    desc: "Plain-English breakdowns of FDA warning letters and FTC enforcement actions.",
  },
  {
    href: "/pricing",
    title: "See pricing",
    desc: "$297/mo founding rate locked in for life during beta.",
  },
  {
    href: "/faq",
    title: "Browse the FAQ",
    desc: "Answers to the most common questions about healthcare marketing compliance.",
  },
]

export const metadata = {
  title: "Page not found — RegenCompliance",
  description:
    "The page you're looking for doesn't exist. Try the demo, read the blog, or browse pricing.",
  robots: { index: false, follow: true },
}

export default function NotFoundPage() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <MarketingBg />
      <MarketingHeader />

      <main id="main-content" className="relative z-10 pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#55E039]/10 border border-[#55E039]/20 mb-6 shadow-[0_0_40px_rgba(85,224,57,0.12)]">
              <FileQuestion className="h-8 w-8 text-[#55E039]" aria-hidden />
            </div>
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
              404
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] text-white">
              That page doesn&apos;t exist.
            </h1>
            <p className="mt-5 text-lg text-white/75 max-w-xl mx-auto leading-relaxed">
              The link may be outdated or the page moved during a redesign. Here
              are a few places worth going instead.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-7 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all"
              >
                <Shield className="h-4 w-4" />
                Home
              </Link>
              <Link
                href="/demo"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#55E039]/25 bg-[#55E039]/[0.04] px-7 text-[15px] font-semibold text-[#55E039] hover:bg-[#55E039]/[0.08] transition-all"
              >
                <Search className="h-4 w-4" />
                Try the demo
              </Link>
            </div>
          </div>

          <div className="mt-14">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4 text-center">
              Did you mean
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] hover:border-[#55E039]/25 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-white group-hover:text-[#55E039] transition-colors">
                        {s.title}
                      </h2>
                      <p className="mt-2 text-sm text-white/65 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-[#55E039] shrink-0 transition-colors" aria-hidden />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}
