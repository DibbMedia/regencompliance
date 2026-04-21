import { createServiceClient } from "@/lib/supabase/server"
import { Shield, CheckCircle2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface VerifyPageProps {
  params: Promise<{ id: string }>
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { id: badgeId } = await params

  const supabase = createServiceClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, clinic_name, created_at")
    .eq("badge_id", badgeId)
    .single()

  if (!profile) {
    notFound()
  }

  // Get last 5 scans
  const { data: scans } = await supabase
    .from("scans")
    .select("compliance_score, created_at")
    .eq("profile_id", profile.id)
    .not("compliance_score", "is", null)
    .order("created_at", { ascending: false })
    .limit(5)

  const hasScans = scans && scans.length > 0
  const avgScore = hasScans
    ? Math.round(
        scans.reduce((sum, s) => sum + (s.compliance_score || 0), 0) /
          scans.length
      )
    : null
  const lastScanDate = hasScans
    ? new Date(scans[0].created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null
  const verifiedSince = new Date(profile.created_at).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  )

  const scoreColor =
    avgScore === null
      ? "text-white/60"
      : avgScore >= 80
        ? "text-[#55E039]"
        : avgScore >= 70
          ? "text-yellow-400"
          : "text-red-400"

  const scoreRange =
    avgScore === null
      ? "N/A"
      : avgScore >= 90
        ? "Excellent (90-100)"
        : avgScore >= 80
          ? "Good (80-89)"
          : avgScore >= 70
            ? "Fair (70-79)"
            : "Needs Improvement (<70)"

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#55E039]/10 to-transparent border-b border-white/[0.06] px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#55E039] to-[#3BB82A] shadow-[0_0_30px_rgba(85,224,57,0.2)]">
                <Shield className="h-6 w-6 text-[#0a0a0a]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">
                  Compliance Verified
                </h1>
                <p className="text-sm text-white/40">
                  RegenCompliance Badge Verification
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-6">
            {/* Status */}
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#55E039]" />
              <span className="text-[#55E039] font-semibold text-sm">
                Verified &amp; Active
              </span>
            </div>

            {/* Clinic Name */}
            <div>
              <p className="text-xs font-bold text-white/25 uppercase tracking-[0.2em] mb-1">
                Clinic
              </p>
              <p className="text-xl font-bold text-white">
                {profile.clinic_name || "Healthcare Provider"}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {avgScore !== null && (
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                  <p className="text-xs text-white/40 mb-1">Score Range</p>
                  <p className={`text-sm font-bold ${scoreColor}`}>
                    {scoreRange}
                  </p>
                </div>
              )}
              {lastScanDate && (
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                  <p className="text-xs text-white/40 mb-1">Last Verified</p>
                  <p className="text-sm font-bold text-white">{lastScanDate}</p>
                </div>
              )}
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                <p className="text-xs text-white/40 mb-1">Member Since</p>
                <p className="text-sm font-bold text-white">{verifiedSince}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                <p className="text-xs text-white/40 mb-1">Total Scans</p>
                <p className="text-sm font-bold text-white">
                  {scans?.length || 0}+
                </p>
              </div>
            </div>

            {/* Explanation */}
            <div className="rounded-xl bg-[#55E039]/5 border border-[#55E039]/10 p-4">
              <p className="text-sm text-white/70 leading-relaxed">
                This clinic uses{" "}
                <span className="text-[#55E039] font-semibold">
                  RegenCompliance
                </span>{" "}
                to continuously monitor their marketing materials for FDA and FTC
                compliance. Their content is regularly scanned against a
                database of regulatory guidelines.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.06] px-8 py-4 flex items-center justify-between">
            <p className="text-xs text-white/30">
              Badge ID: {badgeId}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#55E039] hover:text-[#55E039]/80 transition-colors font-medium"
            >
              Learn more
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Branding */}
        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#55E039] to-[#3BB82A]">
              <Shield className="h-3 w-3 text-[#0a0a0a]" />
            </div>
            <span className="text-xs font-bold text-white/40 group-hover:text-white/60 transition-colors">
              Regen<span className="text-[#55E039]/60">Compliance</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
