"use client"

import { HelpCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function HelpButton() {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <Link
      href="/dashboard/help"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="fixed bottom-6 right-6 z-[90] flex h-12 w-12 items-center justify-center rounded-full bg-[#55E039] text-[#0a0a0a] shadow-lg shadow-[#55E039]/20 hover:shadow-[#55E039]/40 hover:scale-105 transition-all duration-200"
    >
      <HelpCircle className="h-5 w-5" />
      {showTooltip && (
        <span className="absolute bottom-full mb-2 right-0 whitespace-nowrap rounded-lg bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
          Help Center
        </span>
      )}
    </Link>
  )
}
