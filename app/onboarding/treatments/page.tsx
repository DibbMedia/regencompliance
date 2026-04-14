"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Check, Sparkles, Plus } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

const TREATMENT_CATEGORIES = [
  {
    label: "Regenerative Medicine",
    treatments: [
      { slug: "prp", label: "PRP (Platelet-Rich Plasma)" },
      { slug: "stem_cell", label: "Stem Cell Therapy" },
      { slug: "exosomes", label: "Exosomes" },
      { slug: "bmac", label: "BMAC" },
      { slug: "whartons_jelly", label: "Wharton's Jelly" },
      { slug: "prolotherapy", label: "Prolotherapy" },
      { slug: "peptide", label: "Peptide Therapy" },
      { slug: "muse_cells", label: "Muse Cells" },
      { slug: "umbilical_cord_blood", label: "Umbilical Cord Blood" },
    ],
  },
  {
    label: "Med Spa & Aesthetics",
    treatments: [
      { slug: "botox", label: "Botox / Neurotoxins" },
      { slug: "dermal_fillers", label: "Dermal Fillers" },
      { slug: "laser_treatments", label: "Laser Treatments" },
      { slug: "chemical_peels", label: "Chemical Peels" },
      { slug: "microneedling", label: "Microneedling" },
      { slug: "body_contouring", label: "Body Contouring" },
    ],
  },
  {
    label: "Weight Loss & Wellness",
    treatments: [
      { slug: "glp1", label: "GLP-1 / Semaglutide" },
      { slug: "iv_therapy", label: "IV Therapy / NAD+" },
      { slug: "hormone_therapy", label: "Hormone Therapy / BHRT" },
      { slug: "weight_loss", label: "Medical Weight Loss" },
      { slug: "nutrition", label: "Nutrition Programs" },
    ],
  },
  {
    label: "Dental & Surgical",
    treatments: [
      { slug: "dental_implants", label: "Dental Implants" },
      { slug: "cosmetic_dentistry", label: "Cosmetic Dentistry" },
      { slug: "plastic_surgery", label: "Plastic Surgery" },
      { slug: "dermatology", label: "Dermatology" },
      { slug: "orthopedic", label: "Orthopedic / Sports Medicine" },
    ],
  },
  {
    label: "Other Specialties",
    treatments: [
      { slug: "longevity", label: "Longevity" },
      { slug: "physical_therapy", label: "Physical Therapy" },
      { slug: "functional_medicine", label: "Functional Medicine" },
      { slug: "hyperbaric", label: "Hyperbaric Oxygen (HBOT)" },
    ],
  },
]

export default function OnboardingTreatmentsPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [customTreatment, setCustomTreatment] = useState("")
  const [customTreatments, setCustomTreatments] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function addCustom() {
    const trimmed = customTreatment.trim()
    if (!trimmed || customTreatments.includes(trimmed)) return
    setCustomTreatments((prev) => [...prev, trimmed])
    setSelected((prev) => [...prev, trimmed])
    setCustomTreatment("")
  }

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
      updates.treatments = [...new Set(selected)]
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
        <h1 className="text-xl font-bold text-white mb-1">What services does your practice offer?</h1>
        <p className="text-sm text-white/40 mb-6">
          This helps us tailor compliance rules to your specific services. Select all that apply, or add your own.
        </p>

        {/* Treatment categories */}
        <div className="space-y-5 mb-6">
          {TREATMENT_CATEGORIES.map((cat) => (
            <div key={cat.label}>
              <p className="text-xs font-bold text-white/30 uppercase tracking-wider mb-2">{cat.label}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cat.treatments.map((t) => {
                  const isSelected = selected.includes(t.slug)
                  return (
                    <button
                      key={t.slug}
                      type="button"
                      onClick={() => toggleTreatment(t.slug)}
                      disabled={isDisabled}
                      className={`relative flex items-center gap-2.5 rounded-xl border p-3.5 min-h-[44px] text-left transition-all duration-200 disabled:opacity-50 ${
                        isSelected
                          ? "bg-[#55E039]/10 border-[#55E039]/30 text-[#55E039]"
                          : "bg-white/[0.02] border-white/10 text-white/50 hover:bg-white/[0.04] hover:border-white/15 hover:text-white/70"
                      }`}
                    >
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
            </div>
          ))}

          {/* Custom treatments */}
          {customTreatments.length > 0 && (
            <div>
              <p className="text-xs font-bold text-white/30 uppercase tracking-wider mb-2">Your Custom Services</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {customTreatments.map((t) => (
                  <div
                    key={t}
                    className="relative flex items-center gap-2.5 rounded-xl border p-3.5 min-h-[44px] bg-[#55E039]/10 border-[#55E039]/30 text-[#55E039]"
                  >
                    <span className="text-xs font-medium flex-1">{t}</span>
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#55E039]">
                      <Check className="h-3 w-3 text-[#0a0a0a]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add custom */}
          <div>
            <p className="text-xs font-bold text-white/30 uppercase tracking-wider mb-2">Add Your Own</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTreatment}
                onChange={(e) => setCustomTreatment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
                placeholder="e.g., Ozone Therapy, PRP Hair Restoration..."
                disabled={isDisabled}
                className="flex-1 h-11 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/30 px-4 text-sm focus:outline-none focus:border-[#55E039]/30 transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={addCustom}
                disabled={isDisabled || !customTreatment.trim()}
                className="h-11 px-4 rounded-xl border border-[#55E039]/20 bg-[#55E039]/[0.04] text-[#55E039] text-sm font-medium hover:bg-[#55E039]/[0.08] transition-all disabled:opacity-30"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
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
