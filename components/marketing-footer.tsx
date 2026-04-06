import Link from "next/link"
import { Shield } from "lucide-react"

export function MarketingFooter() {
  return (
    <footer className="bg-[#060606] border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#55E039] to-[#3BB82A]">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-[15px] font-bold text-white">RegenCompliance</span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              FDA/FTC compliance scanning built exclusively for regenerative medicine clinics. Scan, fix, and monitor your marketing content.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-white/50 uppercase tracking-[0.15em] mb-4">Product</p>
            <div className="space-y-2.5">
              <Link href="/features" className="block text-sm text-white/40 hover:text-white/70 transition-colors">Features</Link>
              <Link href="/pricing" className="block text-sm text-white/40 hover:text-white/70 transition-colors">Pricing</Link>
              <Link href="/faq" className="block text-sm text-white/40 hover:text-white/70 transition-colors">FAQ</Link>
              <Link href="/demo" className="block text-sm text-white/40 hover:text-white/70 transition-colors">Demo</Link>
              <Link href="/login" className="block text-sm text-white/40 hover:text-white/70 transition-colors">Log In</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-white/50 uppercase tracking-[0.15em] mb-4">Legal</p>
            <div className="space-y-2.5">
              <Link href="/privacy" className="block text-sm text-white/40 hover:text-white/70 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="block text-sm text-white/40 hover:text-white/70 transition-colors">Terms of Service</Link>
              <a href="mailto:support@regenportal.com" className="block text-sm text-white/40 hover:text-white/70 transition-colors">Contact</a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <p className="text-[11px] text-white/20 leading-relaxed text-center">
            RegenCompliance is an educational compliance tool and does not constitute legal or regulatory advice. Not affiliated with the FDA or FTC. &copy; 2026 RegenCompliance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
