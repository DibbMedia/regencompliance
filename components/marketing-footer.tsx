import Link from "next/link"
import { BrandIcon } from "@/components/brand-icon"
import { appUrl } from "@/lib/site-url"

export function MarketingFooter() {
  return (
    <footer className="relative z-10 bg-[#060606] border-t border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <BrandIcon className="h-8 w-8" />
              <span className="text-[15px] font-bold text-white">RegenCompliance</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              FDA/FTC compliance scanning for healthcare practices - regenerative medicine, med spas, dental, dermatology, and more. Scan, fix, and monitor your marketing content.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-[0.15em] mb-4">Product</p>
            <div className="space-y-2.5">
              <Link href="/tools" className="block text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">Tools</Link>
              <Link href="/how-it-works" className="block text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">How it works</Link>
              <Link href="/features" className="block text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">Features</Link>
              <Link href="/pricing" className="block text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">Pricing</Link>
              <Link href="/demo" className="block text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">Demo</Link>
              <Link href="/faq" className="block text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">FAQ</Link>
              <Link href={appUrl("/login")} className="block text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">Log In</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-[0.15em] mb-4">Compare</p>
            <div className="space-y-2.5">
              <Link href="/compare" className="block text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">All comparisons</Link>
              <Link href="/vs/chatgpt" className="block text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">vs ChatGPT</Link>
              <Link href="/vs/claude" className="block text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">vs Claude</Link>
              <Link href="/vs/perplexity" className="block text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">vs Perplexity</Link>
              <Link href="/vs/grammarly" className="block text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">vs Grammarly</Link>
              <Link href="/vs/healthcare-attorney" className="block text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">vs Attorney</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-[0.15em] mb-4">Specialties</p>
            <div className="space-y-2.5">
              <Link href="/for" className="block text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">All specialties</Link>
              <Link href="/for/med-spas" className="block text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">Med spas</Link>
              <Link href="/for/weight-loss-clinics" className="block text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">Weight loss</Link>
              <Link href="/for/regen-clinics" className="block text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">Regen medicine</Link>
              <Link href="/for/dental-practices" className="block text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">Dental</Link>
              <Link href="/for/aesthetic-practices" className="block text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">Aesthetic</Link>
              <Link href="/for/iv-therapy" className="block text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">IV therapy</Link>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-white/[0.06] grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-[0.15em] mb-3">Resources</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/blog" className="text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">Blog</Link>
              <Link href="/glossary" className="text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">Glossary</Link>
              <Link href="/state" className="text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">State rules</Link>
              <Link href="/security" className="text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">Security</Link>
              <Link href="/about" className="text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">About</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-[0.15em] mb-3">Legal</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/privacy" className="text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">Terms</Link>
              <Link href="/cookies" className="text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">Cookies</Link>
              <Link href="/accessibility" className="text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">Accessibility</Link>
              <Link href="/contact" className="text-sm text-white/70 hover:text-[#55E039] focus-visible:text-[#55E039] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/40 focus-visible:rounded-sm transition-colors">Contact</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-[0.15em] mb-3">Trust</p>
            <p className="text-xs text-white/55 leading-relaxed">
              Zero patient data. Daily rule updates. SOC 2 controls in pre-audit; subprocessors are SOC 2 audited. Audit trail on every scan.
            </p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <p className="text-[11px] text-white/50 leading-relaxed text-center">
            RegenCompliance is an educational compliance tool and does not constitute legal or regulatory advice. Not affiliated with the FDA or FTC. &copy; 2026 Regen Portal LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
