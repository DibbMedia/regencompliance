"use client"

import Link from "next/link"
import { Shield, ArrowRight, Menu, X } from "lucide-react"
import { CheckoutButton } from "@/components/checkout-button"
import { useState } from "react"

export function MarketingHeader() {
  const [mobileMenu, setMobileMenu] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-2xl border-b border-white/10" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#55E039] to-[#3BB82A] shadow-lg shadow-[#55E039]/25">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white">RegenCompliance</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-[13px] text-white/60 hover:text-white transition-colors">Features</Link>
            <Link href="/pricing" className="text-[13px] text-white/60 hover:text-white transition-colors">Pricing</Link>
            <Link href="/faq" className="text-[13px] text-white/60 hover:text-white transition-colors">FAQ</Link>
            <Link href="/demo" className="text-[13px] text-[#55E039] hover:text-[#6FF055] font-semibold transition-colors">Try Demo</Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-[13px] text-white/60 hover:text-white transition-colors px-4 py-2">Log In</Link>
            <CheckoutButton className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-6 text-[13px] font-bold text-[#0a0a0a] shadow-lg shadow-[#55E039]/25 hover:shadow-[#55E039]/40 hover:brightness-110 transition-all cursor-pointer">
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </CheckoutButton>
          </div>
          <button className="md:hidden text-white/60 hover:text-white" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-1 bg-[#0a0a0a]/90 backdrop-blur-xl -mx-6 px-6">
            <Link href="/features" className="block text-sm text-white/60 hover:text-white py-2.5">Features</Link>
            <Link href="/pricing" className="block text-sm text-white/60 hover:text-white py-2.5">Pricing</Link>
            <Link href="/faq" className="block text-sm text-white/60 hover:text-white py-2.5">FAQ</Link>
            <Link href="/demo" className="block text-sm text-[#55E039] font-semibold py-2.5">Try Demo</Link>
            <Link href="/login" className="block text-sm text-white/60 py-2.5">Log In</Link>
          </div>
        )}
      </div>
    </header>
  )
}
