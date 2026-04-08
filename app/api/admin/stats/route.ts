import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"

const BETA_PRICE = 297
const STANDARD_PRICE = 497
const BETA_SPOTS = 25

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

    // Beta subscribers — profiles with is_beta = true and active status
    let betaSubscribers = 0
    try {
      const { count: betaCount } = await serviceClient
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_beta", true)
        .eq("subscription_status", "active")
      betaSubscribers = betaCount || 0
    } catch {
      // is_beta column may not exist
    }

    // Total scans
    const { count: totalScans } = await serviceClient
      .from("scans")
      .select("*", { count: "exact", head: true })

    // Revenue
    const activeSubs = activeSubscribers || 0
    const standardSubs = activeSubs - betaSubscribers
    const betaMrr = betaSubscribers * BETA_PRICE
    const standardMrr = standardSubs * STANDARD_PRICE
    const mrr = betaMrr + standardMrr
    const arr = mrr * 12
    const avgRevenuePerUser =
      (totalUsers || 0) > 0 ? Math.round(mrr / (totalUsers || 1)) : 0

    // Scans per day (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const { data: recentScans } = await serviceClient
      .from("scans")
      .select("created_at")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true })

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

    // Scans this week
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

    // Scans last month (for comparison)
    const lastMonthStart = new Date()
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)
    lastMonthStart.setDate(1)
    lastMonthStart.setHours(0, 0, 0, 0)
    const lastMonthEnd = new Date(monthStart)
    lastMonthEnd.setMilliseconds(-1)
    const { count: scansLastMonth } = await serviceClient
      .from("scans")
      .select("*", { count: "exact", head: true })
      .gte("created_at", lastMonthStart.toISOString())
      .lte("created_at", lastMonthEnd.toISOString())

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

    let mostCommonViolation = "None"
    let maxViolationCount = 0
    for (const [phrase, count] of Object.entries(violationCounts)) {
      if (count > maxViolationCount) {
        maxViolationCount = count
        mostCommonViolation = phrase
      }
    }

    // Batch-fetch all users once and build an email lookup map
    const {
      data: { users: allUsers },
    } = await serviceClient.auth.admin.listUsers({ perPage: 1000 })
    const emailMap: Record<string, string> = {}
    for (const u of allUsers || []) {
      emailMap[u.id] = u.email || "unknown"
    }

    // Recent signups (last 10)
    const { data: recentSignups } = await serviceClient
      .from("profiles")
      .select("id, clinic_name, subscription_status, created_at")
      .order("created_at", { ascending: false })
      .limit(10)

    const signupsWithEmail = (recentSignups || []).map((signup) => ({
      ...signup,
      email: emailMap[signup.id] || "unknown",
    }))

    // Recent activity: last 10 scans with user email, score, timestamp
    const { data: recentScanActivity } = await serviceClient
      .from("scans")
      .select(
        "id, profile_id, compliance_score, flag_count, content_type, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(10)

    const scanActivity = (recentScanActivity || []).map((scan) => ({
      id: scan.id,
      type: "scan" as string,
      user_email: emailMap[scan.profile_id] || "unknown",
      profile_id: scan.profile_id,
      description: `Scanned ${scan.content_type?.replace(/_/g, " ") || "content"} — Score: ${scan.compliance_score ?? "N/A"}%, ${scan.flag_count || 0} flags`,
      compliance_score: scan.compliance_score,
      flag_count: scan.flag_count,
      content_type: scan.content_type,
      created_at: scan.created_at,
    }))

    // Recent signups as activity events
    const signupActivity = (recentSignups || []).slice(0, 5).map((signup) => ({
      id: `signup-${signup.id}`,
      type: "signup" as string,
      user_email: emailMap[signup.id] || "unknown",
      profile_id: signup.id,
      description: `New user signed up${signup.clinic_name ? ` — ${signup.clinic_name}` : ""}`,
      compliance_score: null,
      flag_count: 0,
      content_type: null,
      created_at: signup.created_at,
    }))

    // Recent tickets as activity events
    let ticketActivity: Array<{
      id: string
      type: string
      user_email: string
      profile_id: string
      description: string
      compliance_score: number | null
      flag_count: number
      content_type: string | null
      created_at: string
    }> = []
    try {
      const { data: recentTickets } = await serviceClient
        .from("support_tickets")
        .select("id, profile_id, user_id, subject, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5)

      ticketActivity = (recentTickets || []).map((ticket) => {
        const pid = ticket.user_id || ticket.profile_id
        return {
          id: `ticket-${ticket.id}`,
          type: "ticket" as const,
          user_email: pid ? emailMap[pid] || "unknown" : "unknown",
          profile_id: pid || "",
          description: `Ticket: ${ticket.subject} [${ticket.status}]`,
          compliance_score: null,
          flag_count: 0,
          content_type: null,
          created_at: ticket.created_at,
        }
      })
    } catch {
      // support_tickets table may not exist
    }

    // Merge & sort all activity by date
    const recentActivity = [
      ...scanActivity,
      ...signupActivity,
      ...ticketActivity,
    ]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 10)

    // Support tickets counts
    let openTickets = 0
    let inProgressTickets = 0
    let resolvedTickets = 0
    let totalTickets = 0
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

      const { count: resCount } = await serviceClient
        .from("support_tickets")
        .select("*", { count: "exact", head: true })
        .eq("status", "resolved")
      resolvedTickets = resCount || 0

      const { count: allCount } = await serviceClient
        .from("support_tickets")
        .select("*", { count: "exact", head: true })
      totalTickets = allCount || 0
    } catch {
      // support_tickets table may not exist
    }

    // API usage today (table may not exist)
    let apiCostToday = 0
    let apiCostThisWeek = 0
    let apiCostThisMonth = 0
    let apiCallsToday = 0
    try {
      const { data: todayUsage } = await serviceClient
        .from("api_usage")
        .select("estimated_cost_cents")
        .gte("created_at", todayStart.toISOString())
      if (todayUsage) {
        apiCallsToday = todayUsage.length
        apiCostToday = todayUsage.reduce(
          (sum, r) => sum + (r.estimated_cost_cents || 0),
          0
        )
      }

      const { data: weekUsage } = await serviceClient
        .from("api_usage")
        .select("estimated_cost_cents")
        .gte("created_at", weekStart.toISOString())
      if (weekUsage) {
        apiCostThisWeek = weekUsage.reduce(
          (sum, r) => sum + (r.estimated_cost_cents || 0),
          0
        )
      }

      const { data: monthUsage } = await serviceClient
        .from("api_usage")
        .select("estimated_cost_cents")
        .gte("created_at", monthStart.toISOString())
      if (monthUsage) {
        apiCostThisMonth = monthUsage.reduce(
          (sum, r) => sum + (r.estimated_cost_cents || 0),
          0
        )
      }
    } catch {
      // api_usage table may not exist
    }

    // User growth (new users last 7 days vs prior 7 days)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13)
    fourteenDaysAgo.setHours(0, 0, 0, 0)
    const { count: usersLastWeek } = await serviceClient
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString())
    const { count: usersPriorWeek } = await serviceClient
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", fourteenDaysAgo.toISOString())
      .lt("created_at", sevenDaysAgo.toISOString())

    const userGrowth = (usersLastWeek || 0) - (usersPriorWeek || 0)

    // Cron status (static — we track what's configured)
    const cronStatus = {
      scrapeRules: { name: "scrape-rules", status: "configured" },
      deepScrape: { name: "deep-scrape", status: "configured" },
      siteMonitor: { name: "site-monitor", status: "configured" },
    }

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeSubscribers: activeSubs,
      churnedCount: churnedCount || 0,
      totalScans: totalScans || 0,
      betaSubscribers,
      betaSpots: BETA_SPOTS,
      betaMrr,
      standardMrr,
      mrr,
      arr,
      revenue: mrr,
      avgRevenuePerUser,
      scansPerDay,
      scansToday: scansToday || 0,
      scansThisWeek: scansThisWeek || 0,
      scansThisMonth: scansThisMonth || 0,
      scansLastMonth: scansLastMonth || 0,
      avgScore,
      totalFlags,
      mostCommonViolation,
      recentSignups: signupsWithEmail,
      recentActivity,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      totalTickets,
      userGrowth,
      apiCostToday,
      apiCostThisWeek,
      apiCostThisMonth,
      apiCallsToday,
      cronStatus,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
