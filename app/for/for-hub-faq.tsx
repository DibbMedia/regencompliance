"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { SPECIALTY_HUB_FAQS } from "./hub-faqs"

export function ForHubFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {SPECIALTY_HUB_FAQS.map((faq, i) => (
        <div key={i}>
          <button
            id={`for-faq-btn-${i}`}
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            aria-expanded={openFaq === i}
            aria-controls={`for-faq-panel-${i}`}
            className={`w-full text-left rounded-2xl border px-6 py-5 transition-all duration-300 ${
              openFaq === i
                ? "border-[#55E039]/30 bg-white/[0.10]"
                : "border-white/15 bg-white/[0.06] hover:bg-white/[0.10]"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-[15px] font-semibold text-white pr-4">
                {faq.q}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-white/60 shrink-0 transition-transform duration-300 ${
                  openFaq === i ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>
          {openFaq === i && (
            <div
              id={`for-faq-panel-${i}`}
              role="region"
              aria-labelledby={`for-faq-btn-${i}`}
              className="px-6 pb-5"
            >
              <p className="mt-4 text-sm sm:text-[15px] text-white/75 leading-relaxed">
                {faq.a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
