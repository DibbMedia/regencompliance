import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"

interface Flag {
  banned_phrase?: string
  reason?: string
  risk_level?: string
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

    // Fetch last 90 days of scans (covers 12 weeks + buffer)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const { data: scans, error } = await supabase
      .from("scans")
      .select(
        "id, compliance_score, content_type, flag_count, flags, created_at"
      )
      .eq("profile_id", profileId)
      .gte("created_at", ninetyDaysAgo.toISOString())
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Compliance trends query error:", error)
      return NextResponse.json(
        { error: "Failed to fetch compliance data" },
        { status: 500 }
      )
    }

    const allScans = scans || []

    // --- Daily scores (last 30 days) ---
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const dailyMap: Record<string, { total: number; count: number }> = {}
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo)
      d.setDate(d.getDate() + i)
      dailyMap[d.toISOString().split("T")[0]] = { total: 0, count: 0 }
    }

    for (const scan of allScans) {
      const day = scan.created_at.split("T")[0]
      if (dailyMap[day] !== undefined) {
        dailyMap[day].total += scan.compliance_score || 0
        dailyMap[day].count += 1
      }
    }

    const daily_scores = Object.entries(dailyMap).map(([date, v]) => ({
      date,
      avg_score: v.count > 0 ? Math.round(v.total / v.count) : 0,
      scan_count: v.count,
    }))

    // --- Weekly scores (last 12 weeks) ---
    const now = new Date()
    const weeklyMap: Record<string, { total: number; count: number }> = {}
    const weekLabels: string[] = []

    for (let w = 11; w >= 0; w--) {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() - w * 7)
      weekStart.setHours(0, 0, 0, 0)
      const label = weekStart.toISOString().split("T")[0]
      weekLabels.push(label)
      weeklyMap[label] = { total: 0, count: 0 }
    }

    for (const scan of allScans) {
      const scanDate = new Date(scan.created_at)
      // Find which week bucket this scan belongs to
      for (let w = weekLabels.length - 1; w >= 0; w--) {
        const weekStart = new Date(weekLabels[w])
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 7)
        if (scanDate >= weekStart && scanDate < weekEnd) {
          weeklyMap[weekLabels[w]].total += scan.compliance_score || 0
          weeklyMap[weekLabels[w]].count += 1
          break
        }
      }
    }

    const weekly_scores = weekLabels.map((week) => ({
      week,
      avg_score:
        weeklyMap[week].count > 0
          ? Math.round(weeklyMap[week].total / weeklyMap[week].count)
          : 0,
      scan_count: weeklyMap[week].count,
    }))

    // --- Overall stats ---
    const totalScans = allScans.length
    const scores = allScans
      .map((s) => s.compliance_score)
      .filter((s): s is number => s !== null && s !== undefined)

    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0
    const worstScore = scores.length > 0 ? Math.min(...scores) : 0

    // Improvement: avg of last 7 days vs previous 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const last7 = allScans.filter(
      (s) => new Date(s.created_at) >= sevenDaysAgo
    )
    const prev7 = allScans.filter(
      (s) =>
        new Date(s.created_at) >= fourteenDaysAgo &&
        new Date(s.created_at) < sevenDaysAgo
    )

    const avg7 =
      last7.length > 0
        ? last7.reduce((sum, s) => sum + (s.compliance_score || 0), 0) /
          last7.length
        : 0
    const avgPrev7 =
      prev7.length > 0
        ? prev7.reduce((sum, s) => sum + (s.compliance_score || 0), 0) /
          prev7.length
        : 0
    const improvement = Math.round(avg7 - avgPrev7)

    // --- Violation counting ---
    const violationCounts: Record<
      string,
      { count: number; risk_level: string }
    > = {}

    for (const scan of allScans) {
      const flags = scan.flags
      if (Array.isArray(flags)) {
        for (const flag of flags as Flag[]) {
          const phrase = flag.banned_phrase || flag.reason || "Unknown"
          if (!violationCounts[phrase]) {
            violationCounts[phrase] = {
              count: 0,
              risk_level: flag.risk_level || "medium",
            }
          }
          violationCounts[phrase].count += 1
          // Keep the highest risk level seen
          if (
            flag.risk_level === "high" &&
            violationCounts[phrase].risk_level !== "high"
          ) {
            violationCounts[phrase].risk_level = "high"
          }
        }
      }
    }

    const sortedViolations = Object.entries(violationCounts).sort(
      ([, a], [, b]) => b.count - a.count
    )

    const most_common_violation =
      sortedViolations.length > 0 ? sortedViolations[0][0] : "None"

    const recent_flags = sortedViolations.slice(0, 10).map(([phrase, v]) => ({
      banned_phrase: phrase,
      count: v.count,
      risk_level: v.risk_level,
    }))

    // --- By content type ---
    const contentTypeMap: Record<string, { total: number; count: number }> = {}
    for (const scan of allScans) {
      const ct = scan.content_type || "other"
      if (!contentTypeMap[ct]) {
        contentTypeMap[ct] = { total: 0, count: 0 }
      }
      contentTypeMap[ct].total += scan.compliance_score || 0
      contentTypeMap[ct].count += 1
    }

    const by_content_type = Object.entries(contentTypeMap).map(
      ([content_type, v]) => ({
        content_type,
        avg_score: v.count > 0 ? Math.round(v.total / v.count) : 0,
        scan_count: v.count,
      })
    )

    // --- Monitored sites summary ---
    const { data: sites } = await supabase
      .from("monitored_sites")
      .select("id, avg_compliance_score, is_active")
      .eq("profile_id", profileId)
      .eq("is_active", true)

    const activeSites = sites || []
    const siteScores = activeSites
      .map((s) => s.avg_compliance_score)
      .filter((s): s is number => s !== null && s !== undefined)
    const avgSiteScore =
      siteScores.length > 0
        ? Math.round(siteScores.reduce((a, b) => a + b, 0) / siteScores.length)
        : 0

    return NextResponse.json({
      daily_scores,
      weekly_scores,
      overall: {
        total_scans: totalScans,
        avg_score: avgScore,
        best_score: bestScore,
        worst_score: worstScore,
        most_common_violation,
        improvement,
      },
      by_content_type,
      recent_flags,
      monitored_sites: {
        count: activeSites.length,
        avg_score: avgSiteScore,
      },
      last_7_day_avg: Math.round(avg7),
    })
  } catch (error) {
    console.error("Compliance trends error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
