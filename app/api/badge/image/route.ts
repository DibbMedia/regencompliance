import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const badgeId = searchParams.get("id")

    if (!badgeId) {
      return new NextResponse(renderErrorSvg("Missing badge ID"), {
        status: 400,
        headers: svgHeaders(),
      })
    }

    const supabase = createServiceClient()

    // Look up profile by badge_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, clinic_name, created_at")
      .eq("badge_id", badgeId)
      .single()

    if (!profile) {
      return new NextResponse(renderErrorSvg("Invalid badge"), {
        status: 404,
        headers: svgHeaders(),
      })
    }

    // Get last 5 scans for avg score
    const { data: scans } = await supabase
      .from("scans")
      .select("compliance_score, created_at")
      .eq("profile_id", profile.id)
      .not("compliance_score", "is", null)
      .order("created_at", { ascending: false })
      .limit(5)

    if (!scans || scans.length === 0) {
      return new NextResponse(renderErrorSvg("No scans"), {
        status: 404,
        headers: svgHeaders(),
      })
    }

    const avgScore = Math.round(
      scans.reduce((sum, s) => sum + (s.compliance_score || 0), 0) /
        scans.length
    )
    const lastDate = new Date(scans[0].created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

    const showScore = avgScore >= 70
    const svg = renderBadgeSvg(avgScore, lastDate, showScore)

    return new NextResponse(svg, {
      status: 200,
      headers: svgHeaders(),
    })
  } catch (error) {
    console.error("Badge image error:", error)
    return new NextResponse(renderErrorSvg("Error"), {
      status: 500,
      headers: svgHeaders(),
    })
  }
}

function svgHeaders(): Record<string, string> {
  return {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "public, max-age=3600, s-maxage=3600",
    "Access-Control-Allow-Origin": "*",
  }
}

function renderBadgeSvg(
  score: number,
  lastDate: string,
  showScore: boolean
): string {
  const scoreColor = score >= 80 ? "#55E039" : score >= 60 ? "#eab308" : "#ef4444"
  const scoreText = showScore ? `Score: ${score}%` : "Verified"

  return `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="60" viewBox="0 0 180 60">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#111111"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
    <linearGradient id="green" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#55E039"/>
      <stop offset="100%" stop-color="#3BB82A"/>
    </linearGradient>
  </defs>
  <rect width="180" height="60" rx="8" fill="url(#bg)" stroke="#333" stroke-width="1"/>
  <!-- Shield icon -->
  <g transform="translate(12, 12)">
    <rect width="36" height="36" rx="8" fill="url(#green)" opacity="0.15"/>
    <path d="M18 8 L28 13 V21 C28 27 23 31 18 33 C13 31 8 27 8 21 V13 L18 8Z" fill="none" stroke="#55E039" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M14 21 L17 24 L23 17" fill="none" stroke="#55E039" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <!-- Text -->
  <text x="56" y="20" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="700" fill="white">Verified by</text>
  <text x="56" y="32" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="700" fill="#55E039">RegenCompliance</text>
  <text x="56" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="${scoreColor}" font-weight="600">${scoreText}</text>
  <text x="56" y="55" font-family="system-ui, -apple-system, sans-serif" font-size="7" fill="#666">${lastDate}</text>
</svg>`
}

function renderErrorSvg(message: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="60" viewBox="0 0 180 60">
  <rect width="180" height="60" rx="8" fill="#111" stroke="#333" stroke-width="1"/>
  <text x="90" y="34" font-family="system-ui, sans-serif" font-size="10" fill="#666" text-anchor="middle">${message}</text>
</svg>`
}
