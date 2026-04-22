"use client"

import Link from "next/link"
import { Shield, ArrowRight, Menu, X } from "lucide-react"
import { useState } from "react"
import { IS_LAUNCHED } from "@/lib/env"
import { CheckoutButton } from "@/components/checkout-button"

export function MarketingHeader() {
  const [mobileMenu, setMobileMenu] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#55E039] focus:text-[#0a0a0a] focus:rounded-lg focus:font-bold focus:text-sm">Skip to content</a>
      <div className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-2xl border-b border-white/10 pointer-events-none" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#55E039] to-[#3BB82A] shadow-lg shadow-[#55E039]/25">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white">RegenCompliance</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 lg:gap-7">
            <Link href="/features" className="text-sm text-white/75 hover:text-white transition-colors">Features</Link>
            <Link href="/pricing" className="text-sm text-white/75 hover:text-white transition-colors">Pricing</Link>
            <Link href="/for" className="text-sm text-white/75 hover:text-white transition-colors">For clinics</Link>
            <Link href="/compare" className="text-sm text-white/75 hover:text-white transition-colors">Compare</Link>
            <Link href="/blog" className="text-sm text-white/75 hover:text-white transition-colors">Blog</Link>
            <Link href="/demo" className="text-sm text-[#55E039] hover:text-[#6FF055] font-semibold transition-colors">Try Demo</Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/75 hover:text-white transition-colors px-4 py-2">Log In</Link>
            {IS_LAUNCHED ? (
              <CheckoutButton className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-6 text-[13px] font-bold text-[#0a0a0a] shadow-lg shadow-[#55E039]/25 hover:shadow-[#55E039]/40 hover:brightness-110 transition-all cursor-pointer disabled:opacity-70">
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </CheckoutButton>
            ) : (
              <Link
                href="/waitlist"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-6 text-[13px] font-bold text-[#0a0a0a] shadow-lg shadow-[#55E039]/25 hover:shadow-[#55E039]/40 hover:brightness-110 transition-all cursor-pointer"
              >
                Join Waitlist
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          <button className="md:hidden -m-2.5 p-2.5 text-white/60 hover:text-white" onClick={() => setMobileMenu(!mobileMenu)} aria-label={mobileMenu ? "Close menu" : "Open menu"} aria-expanded={mobileMenu}>
            {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-1 bg-[#0a0a0a]/90 backdrop-blur-xl -mx-6 px-6">
            <Link href="/features" className="block text-sm text-white/75 hover:text-white py-2.5">Features</Link>
            <Link href="/pricing" className="block text-sm text-white/75 hover:text-white py-2.5">Pricing</Link>
            <Link href="/for" className="block text-sm text-white/75 hover:text-white py-2.5">For clinics</Link>
            <Link href="/compare" className="block text-sm text-white/75 hover:text-white py-2.5">Compare</Link>
            <Link href="/blog" className="block text-sm text-white/75 hover:text-white py-2.5">Blog</Link>
            <Link href="/glossary" className="block text-sm text-white/75 hover:text-white py-2.5">Glossary</Link>
            <Link href="/faq" className="block text-sm text-white/75 hover:text-white py-2.5">FAQ</Link>
            <Link href="/demo" className="block text-sm text-[#55E039] font-semibold py-2.5">Try Demo</Link>
            <Link href="/login" className="block text-sm text-white/75 py-2.5">Log In</Link>
            {IS_LAUNCHED ? (
              <Link href="/pricing" className="block text-sm text-[#55E039] font-bold py-2.5">Get Started →</Link>
            ) : (
              <Link href="/waitlist" className="block text-sm text-[#55E039] font-bold py-2.5">Join Waitlist →</Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
