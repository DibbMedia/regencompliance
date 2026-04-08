"use client"

import { useState } from "react"

interface HelpTooltipProps {
  text: string
  children?: React.ReactNode
}

export function HelpTooltip({ text, children }: HelpTooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible((v) => !v)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-white/40 text-xs hover:bg-white/[0.1] hover:text-white/60 transition-all cursor-help shrink-0"
        aria-label="Help"
      >
        ?
      </button>
      {visible && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-64 rounded-lg bg-[#1a1a1a] border border-white/10 px-3 py-2.5 text-xs text-white/70 leading-relaxed shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-none">
          {children || text}
          <span className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 rotate-45 bg-[#1a1a1a] border-r border-b border-white/10" />
        </span>
      )}
    </span>
  )
}
