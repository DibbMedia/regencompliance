"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Upload, ImageIcon, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export default function OnboardingClinicPage() {
  const [clinicName, setClinicName] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function processFile(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB")
      return
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Only PNG, JPG, or WebP files accepted")
      return
    }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clinicName.trim()) {
      toast.error("Clinic name is required")
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    let logoUrl: string | null = null
    if (logoFile) {
      const ext = logoFile.name.split(".").pop()
      const path = `${user.id}/logo.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(path, logoFile, { upsert: true })
      if (!uploadError) {
        const { data } = supabase.storage.from("logos").getPublicUrl(path)
        logoUrl = data.publicUrl
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ clinic_name: clinicName, ...(logoUrl && { logo_url: logoUrl }) })
      .eq("id", user.id)

    setLoading(false)
    if (error) {
      toast.error("Failed to save. Please try again.")
      return
    }

    router.push("/onboarding/treatments")
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em]">Step 1 of 2</span>
          <span className="text-xs text-white/30">Clinic Setup</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#55E039] to-[#3BB82A] transition-all duration-500" />
        </div>
      </div>

      {/* Card */}
      <div className="rounded-xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 shadow-[0_0_30px_rgba(85,224,57,0.05)]">
        <h1 className="text-xl font-bold text-white mb-1">Let&apos;s set up your clinic</h1>
        <p className="text-sm text-white/40 mb-6">Tell us about your clinic to personalize your compliance experience.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Clinic Name */}
          <div className="space-y-2">
            <label htmlFor="clinic-name" className="text-sm font-medium text-white/70">
              Clinic Name <span className="text-red-400">*</span>
            </label>
            <input
              id="clinic-name"
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder="e.g. Rejuve Wellness Center"
              required
              className="w-full h-11 rounded-xl bg-white/[0.03] border border-white/10 px-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#55E039]/30 focus:ring-1 focus:ring-[#55E039]/20 transition-all"
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Logo <span className="text-white/30">(optional)</span></label>

            {!logoPreview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 sm:p-6 lg:p-8 transition-all duration-200 cursor-pointer ${
                  dragOver
                    ? "border-[#55E039]/40 bg-[#55E039]/5"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                }`}
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className={`h-8 w-8 mb-3 ${dragOver ? "text-[#55E039]" : "text-white/20"}`} />
                <p className="text-sm text-white/50">
                  <span className="text-[#55E039] font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-white/25 mt-1">PNG, JPG, or WebP. Max 2MB.</p>
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-xl bg-white/[0.03] border border-white/10 p-4">
                <img src={logoPreview} alt="Logo preview" className="h-14 w-14 rounded-lg object-cover border border-white/10" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{logoFile?.name}</p>
                  <p className="text-xs text-white/30">{logoFile ? `${(logoFile.size / 1024).toFixed(0)} KB` : ""}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setLogoFile(null); setLogoPreview(null) }}
                  className="text-xs text-white/30 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !clinicName.trim()}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] font-semibold shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_25px_rgba(85,224,57,0.45)] hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
