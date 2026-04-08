"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Check, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

const TREATMENTS = [
  { slug: "prp", label: "PRP (Platelet-Rich Plasma)", emoji: "🩸" },
  { slug: "stem_cell", label: "Stem Cell Therapy", emoji: "🧬" },
  { slug: "exosomes", label: "Exosomes", emoji: "🔬" },
  { slug: "bmac", label: "BMAC", emoji: "🦴" },
  { slug: "whartons_jelly", label: "Wharton's Jelly", emoji: "🧪" },
  { slug: "prolotherapy", label: "Prolotherapy", emoji: "💉" },
  { slug: "peptide", label: "Peptide Therapy", emoji: "⚗️" },
  { slug: "other", label: "Other Regenerative", emoji: "✨" },
]

export default function OnboardingTreatmentsPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function toggleTreatment(slug: string) {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  async function handleFinish(skip = false) {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const updates: Record<string, unknown> = { onboarding_complete: true }
    if (!skip && selected.length > 0) {
      updates.treatments = selected
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)

    if (error) {
      setLoading(false)
      toast.error("Failed to save. Please try again.")
      return
    }

    setRedirecting(true)
    toast.success("Setup complete! Setting up your dashboard...")
    router.push("/dashboard/scanner")
  }

  const isDisabled = loading || redirecting

  if (redirecting) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#55E039]" />
        <p className="text-sm text-white/60">Setting up your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em]">Step 2 of 2</span>
          <span className="text-xs text-white/30">Treatments</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-[#55E039] to-[#3BB82A] transition-all duration-500" />
        </div>
      </div>

      {/* Card */}
      <div className="rounded-xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 shadow-[0_0_30px_rgba(85,224,57,0.05)]">
        <h1 className="text-xl font-bold text-white mb-1">What treatments does your clinic offer?</h1>
        <p className="text-sm text-white/40 mb-6">
          This helps us tailor compliance rules to your specific services. Select all that apply.
        </p>

        {/* Treatment pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
          {TREATMENTS.map((t) => {
            const isSelected = selected.includes(t.slug)
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => toggleTreatment(t.slug)}
                disabled={isDisabled}
                className={`relative flex items-center gap-2.5 rounded-xl border p-4 sm:p-3.5 min-h-[48px] text-left transition-all duration-200 disabled:opacity-50 ${
                  isSelected
                    ? "bg-[#55E039]/10 border-[#55E039]/30 text-[#55E039]"
                    : "bg-white/[0.02] border-white/10 text-white/50 hover:bg-white/[0.04] hover:border-white/15 hover:text-white/70"
                }`}
              >
                <span className="text-base">{t.emoji}</span>
                <span className="text-xs font-medium flex-1">{t.label}</span>
                {isSelected && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#55E039]">
                    <Check className="h-3 w-3 text-[#0a0a0a]" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {selected.length > 0 && (
          <p className="text-xs text-white/30 mb-4 text-center">
            {selected.length} treatment{selected.length !== 1 ? "s" : ""} selected
          </p>
        )}

        <button
          disabled={isDisabled || selected.length === 0}
          onClick={() => handleFinish(false)}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] font-semibold shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_25px_rgba(85,224,57,0.45)] hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Finishing setup...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Finish Setup
            </>
          )}
        </button>

        <button
          type="button"
          className="w-full mt-3 text-center text-sm text-white/30 hover:text-white/50 transition-colors py-2"
          onClick={() => handleFinish(true)}
          disabled={isDisabled}
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
