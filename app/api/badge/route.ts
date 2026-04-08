import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"

function generateBadgeId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileId = await effectiveProfileId(user.id, supabase)

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("clinic_name, badge_id, created_at")
      .eq("id", profileId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Get last 5 scans for avg score
    const { data: scans, error: scansError } = await supabase
      .from("scans")
      .select("compliance_score, created_at")
      .eq("profile_id", profileId)
      .not("compliance_score", "is", null)
      .order("created_at", { ascending: false })
      .limit(5)

    if (scansError) {
      console.error("Badge scans error:", scansError)
      return NextResponse.json(
        { error: "Failed to fetch scans" },
        { status: 500 }
      )
    }

    if (!scans || scans.length === 0) {
      return NextResponse.json(
        { error: "No scans found. Run at least one scan to generate your badge." },
        { status: 400 }
      )
    }

    // Calculate average score
    const avgScore = Math.round(
      scans.reduce((sum, s) => sum + (s.compliance_score || 0), 0) / scans.length
    )
    const lastScanDate = scans[0].created_at

    // Generate badge_id if not exists
    let badgeId = profile.badge_id
    if (!badgeId) {
      badgeId = generateBadgeId()
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ badge_id: badgeId })
        .eq("id", profileId)

      if (updateError) {
        console.error("Badge ID update error:", updateError)
        return NextResponse.json(
          { error: "Failed to generate badge" },
          { status: 500 }
        )
      }
    }

    // Get total scan count
    const { count: totalScans } = await supabase
      .from("scans")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)

    const baseUrl = "https://compliance.regenportal.com"
    const badgeUrl = `${baseUrl}/verify/${badgeId}`
    const imageUrl = `${baseUrl}/api/badge/image?id=${badgeId}`

    const embedCode = `<a href="${badgeUrl}" target="_blank" rel="noopener">\n  <img src="${imageUrl}" alt="Verified by RegenCompliance" width="180" height="60" />\n</a>`

    return NextResponse.json({
      clinic_name: profile.clinic_name || "Unknown Clinic",
      badge_id: badgeId,
      last_scan_date: lastScanDate,
      avg_score: avgScore,
      total_scans: totalScans || 0,
      verified_since: profile.created_at,
      badge_url: badgeUrl,
      embed_code: embedCode,
    })
  } catch (error) {
    console.error("Badge error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
