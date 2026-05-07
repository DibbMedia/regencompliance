"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import type { GlossaryTerm } from "@/lib/glossary/terms"

interface TermCardProps {
  term: GlossaryTerm
  relatedTermNames: Array<{ slug: string; term: string }>
}

export function TermCard({ term: t, relatedTermNames }: TermCardProps) {
  const [open, setOpen] = useState(false)
  const hasReadMore = Boolean(t.fullDefinition || t.whyItMatters || t.example)
  const panelId = `term-panel-${t.slug}`
  const buttonId = `term-btn-${t.slug}`

  return (
    <article
      id={t.slug}
      className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.06] p-6 sm:p-7 hover:bg-white/[0.10] transition-all"
    >
      <header className="flex items-baseline justify-between gap-4 flex-wrap mb-3">
        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
          {t.term}
        </h3>
        <a
          href={`#${t.slug}`}
          className="text-[11px] font-semibold text-[#55E039]/70 hover:text-[#55E039] transition-colors"
          aria-label={`Permalink to ${t.term}`}
        >
          #
        </a>
      </header>
      <p className="text-base text-white/85 leading-relaxed font-medium">
        {t.shortDefinition}
      </p>

      {hasReadMore && (
        <>
          <button
            id={buttonId}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#55E039] hover:text-white hover:border-[#55E039]/30 hover:bg-[#55E039]/[0.10] transition-all"
          >
            {open ? "Hide details" : "Read more"}
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
          {open && (
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="mt-4 space-y-5"
            >
              {t.fullDefinition && (
                <div className="pt-5 border-t border-white/[0.06]">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039]/80 mb-2">
                    In depth
                  </p>
                  <p className="text-sm text-white/75 leading-relaxed">
                    {t.fullDefinition}
                  </p>
                </div>
              )}
              {t.whyItMatters && (
                <div className="pt-5 border-t border-white/[0.06]">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039]/80 mb-2">
                    Why this matters for marketing
                  </p>
                  <p className="text-sm text-white/75 leading-relaxed">
                    {t.whyItMatters}
                  </p>
                </div>
              )}
              {t.example && (
                <div className="pt-5 border-t border-white/[0.06]">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039]/80 mb-2">
                    Example
                  </p>
                  <p className="text-sm text-white/70 leading-relaxed italic">
                    {t.example}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {relatedTermNames.length > 0 && (
        <div className="mt-5 pt-5 border-t border-white/[0.06]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039]/80 mb-3">
            Related
          </p>
          <div className="flex flex-wrap gap-2">
            {relatedTermNames.map((rt) => (
              <a
                key={rt.slug}
                href={`#${rt.slug}`}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-white/75 hover:text-white hover:border-[#55E039]/30 transition-all"
              >
                {rt.term}
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
