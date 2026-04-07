import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"

export async function GET() {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) return auth.error
    const { serviceClient } = auth

    // Total users
    const { count: totalUsers } = await serviceClient
      .from("profiles")
      .select("*", { count: "exact", head: true })

    // Active subscribers
    const { count: activeSubscribers } = await serviceClient
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("subscription_status", "active")

    // Churned (cancelled)
    const { count: churnedCount } = await serviceClient
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("subscription_status", "cancelled")

    // Total scans
    const { count: totalScans } = await serviceClient
      .from("scans")
      .select("*", { count: "exact", head: true })

    // Revenue estimate
    const activeSubs = activeSubscribers || 0
    const mrr = activeSubs * 497
    const arr = mrr * 12
    const avgRevenuePerUser = (totalUsers || 0) > 0 ? Math.round(mrr / (totalUsers || 1)) : 0

    // Scans per day (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const { data: recentScans } = await serviceClient
      .from("scans")
      .select("created_at")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true })

    // Aggregate by day
    const dailyCounts: Record<string, number> = {}
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo)
      d.setDate(d.getDate() + i)
      dailyCounts[d.toISOString().split("T")[0]] = 0
    }
    for (const scan of recentScans || []) {
      const day = scan.created_at.split("T")[0]
      if (dailyCounts[day] !== undefined) {
        dailyCounts[day]++
      }
    }
    const scansPerDay = Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count,
    }))

    // Scans today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { count: scansToday } = await serviceClient
      .from("scans")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString())

    // Scans this week (Monday start)
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const { count: scansThisWeek } = await serviceClient
      .from("scans")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekStart.toISOString())

    // Scans this month
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const { count: scansThisMonth } = await serviceClient
      .from("scans")
      .select("*", { count: "exact", head: true })
      .gte("created_at", monthStart.toISOString())

    // Average compliance score & total flags
    const { data: scoreData } = await serviceClient
      .from("scans")
      .select("compliance_score, flag_count, flags")

    let avgScore = 0
    let totalFlags = 0
    const violationCounts: Record<string, number> = {}

    if (scoreData && scoreData.length > 0) {
      const validScores = scoreData.filter(
        (s) => s.compliance_score !== null && s.compliance_score !== undefined
      )
      if (validScores.length > 0) {
        avgScore = Math.round(
          validScores.reduce((sum, s) => sum + (s.compliance_score || 0), 0) /
            validScores.length
        )
      }
      totalFlags = scoreData.reduce((sum, s) => sum + (s.flag_count || 0), 0)

      // Count violation types from flags JSON
      for (const scan of scoreData) {
        const flags = scan.flags
        if (Array.isArray(flags)) {
          for (const flag of flags) {
            const phrase = flag.banned_phrase || flag.reason || "Unknown"
            violationCounts[phrase] = (violationCounts[phrase] || 0) + 1
          }
        }
      }
    }

    // Most common violation
    let mostCommonViolation = "None"
    let maxViolationCount = 0
    for (const [phrase, count] of Object.entries(violationCounts)) {
      if (count > maxViolationCount) {
        maxViolationCount = count
        mostCommonViolation = phrase
      }
    }

    // Recent signups (last 10)
    const { data: recentSignups } = await serviceClient
      .from("profiles")
      .select("id, clinic_name, subscription_status, created_at")
      .order("created_at", { ascending: false })
      .limit(10)

    // Batch-fetch all users once and build an email lookup map
    const { data: { users: allUsers } } = await serviceClient.auth.admin.listUsers({ perPage: 1000 })
    const emailMap: Record<string, string> = {}
    for (const u of allUsers || []) {
      emailMap[u.id] = u.email || "unknown"
    }

    // Resolve emails for recent signups
    const signupsWithEmail = (recentSignups || []).map((signup) => ({
      ...signup,
      email: emailMap[signup.id] || "unknown",
    }))

    // Recent activity: last 10 scans with user email, score, timestamp
    const { data: recentActivity } = await serviceClient
      .from("scans")
      .select("id, profile_id, compliance_score, flag_count, content_type, created_at")
      .order("created_at", { ascending: false })
      .limit(10)

    const activityWithEmail = (recentActivity || []).map((scan) => ({
      ...scan,
      user_email: emailMap[scan.profile_id] || "unknown",
    }))

    // Support tickets (table may not exist yet)
    let openTickets = 0
    let inProgressTickets = 0
    try {
      const { count: openCount } = await serviceClient
        .from("support_tickets")
        .select("*", { count: "exact", head: true })
        .eq("status", "open")
      openTickets = openCount || 0

      const { count: ipCount } = await serviceClient
        .from("support_tickets")
        .select("*", { count: "exact", head: true })
        .eq("status", "in_progress")
      inProgressTickets = ipCount || 0
    } catch {
      // support_tickets table may not exist yet
    }

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeSubscribers: activeSubs,
      churnedCount: churnedCount || 0,
      totalScans: totalScans || 0,
      mrr,
      arr,
      revenue: mrr,
      avgRevenuePerUser,
      scansPerDay,
      scansToday: scansToday || 0,
      scansThisWeek: scansThisWeek || 0,
      scansThisMonth: scansThisMonth || 0,
      avgScore,
      totalFlags,
      mostCommonViolation,
      recentSignups: signupsWithEmail,
      recentActivity: activityWithEmail,
      openTickets,
      inProgressTickets,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
