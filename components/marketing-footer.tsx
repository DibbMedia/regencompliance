import Link from "next/link"
import { Shield } from "lucide-react"

export function MarketingFooter() {
  return (
    <footer className="relative z-10 bg-[#060606] border-t border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#55E039] to-[#3BB82A]">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-[15px] font-bold text-white">RegenCompliance</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              FDA/FTC compliance scanning for healthcare practices — regenerative medicine, med spas, dental, dermatology, and more. Scan, fix, and monitor your marketing content.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-[0.15em] mb-4">Product</p>
            <div className="space-y-2.5">
              <Link href="/tools" className="block text-sm text-white/70 hover:text-white transition-colors">Tools</Link>
              <Link href="/how-it-works" className="block text-sm text-white/70 hover:text-white transition-colors">How it works</Link>
              <Link href="/features" className="block text-sm text-white/70 hover:text-white transition-colors">Features</Link>
              <Link href="/pricing" className="block text-sm text-white/70 hover:text-white transition-colors">Pricing</Link>
              <Link href="/demo" className="block text-sm text-white/70 hover:text-white transition-colors">Demo</Link>
              <Link href="/faq" className="block text-sm text-white/70 hover:text-white transition-colors">FAQ</Link>
              <Link href="/login" className="block text-sm text-white/70 hover:text-white transition-colors">Log In</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-[0.15em] mb-4">Compare</p>
            <div className="space-y-2.5">
              <Link href="/compare" className="block text-sm text-white/70 hover:text-white transition-colors">All comparisons</Link>
              <Link href="/vs/chatgpt" className="block text-sm text-white/70 hover:text-white transition-colors">vs ChatGPT</Link>
              <Link href="/vs/jasper" className="block text-sm text-white/70 hover:text-white transition-colors">vs Jasper</Link>
              <Link href="/vs/grammarly" className="block text-sm text-white/70 hover:text-white transition-colors">vs Grammarly</Link>
              <Link href="/vs/healthcare-attorney" className="block text-sm text-white/70 hover:text-white transition-colors">vs Attorney</Link>
              <Link href="/vs/manual-audit" className="block text-sm text-white/70 hover:text-white transition-colors">vs Manual Audit</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-[0.15em] mb-4">Specialties</p>
            <div className="space-y-2.5">
              <Link href="/for" className="block text-sm text-white/70 hover:text-white transition-colors">All specialties</Link>
              <Link href="/for/med-spas" className="block text-sm text-white/70 hover:text-white transition-colors">Med spas</Link>
              <Link href="/for/weight-loss-clinics" className="block text-sm text-white/70 hover:text-white transition-colors">Weight loss</Link>
              <Link href="/for/regen-clinics" className="block text-sm text-white/70 hover:text-white transition-colors">Regen medicine</Link>
              <Link href="/for/dental-practices" className="block text-sm text-white/70 hover:text-white transition-colors">Dental</Link>
              <Link href="/for/aesthetic-practices" className="block text-sm text-white/70 hover:text-white transition-colors">Aesthetic</Link>
              <Link href="/for/iv-therapy" className="block text-sm text-white/70 hover:text-white transition-colors">IV therapy</Link>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-white/[0.06] grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-[0.15em] mb-3">Resources</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/blog" className="text-sm text-white/70 hover:text-white transition-colors">Blog</Link>
              <Link href="/glossary" className="text-sm text-white/70 hover:text-white transition-colors">Glossary</Link>
              <Link href="/state" className="text-sm text-white/70 hover:text-white transition-colors">State rules</Link>
              <Link href="/security" className="text-sm text-white/70 hover:text-white transition-colors">Security</Link>
              <Link href="/about" className="text-sm text-white/70 hover:text-white transition-colors">About</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-[0.15em] mb-3">Legal</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/privacy" className="text-sm text-white/70 hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm text-white/70 hover:text-white transition-colors">Terms</Link>
              <a href="mailto:support@regencompliance.com" className="text-sm text-white/70 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-white/70 uppercase tracking-[0.15em] mb-3">Trust</p>
            <p className="text-xs text-white/55 leading-relaxed">
              Zero patient data. Daily rule updates. SOC-aligned data handling. Audit trail on every scan.
            </p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <p className="text-[11px] text-white/50 leading-relaxed text-center">
            RegenCompliance is an educational compliance tool and does not constitute legal or regulatory advice. Not affiliated with the FDA or FTC. &copy; 2026 RegenCompliance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
