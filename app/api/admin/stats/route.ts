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

    // Total scans
    const { count: totalScans } = await serviceClient
      .from("scans")
      .select("*", { count: "exact", head: true })

    // Revenue estimate
    const revenue = (activeSubscribers || 0) * 497

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

    // Recent signups (last 10)
    const { data: recentSignups } = await serviceClient
      .from("profiles")
      .select("id, clinic_name, subscription_status, created_at")
      .order("created_at", { ascending: false })
      .limit(10)

    // Resolve emails from auth.users via service client
    const signupsWithEmail = []
    for (const signup of recentSignups || []) {
      const {
        data: { user },
      } = await serviceClient.auth.admin.getUserById(signup.id)
      signupsWithEmail.push({
        ...signup,
        email: user?.email || "unknown",
      })
    }

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeSubscribers: activeSubscribers || 0,
      totalScans: totalScans || 0,
      revenue,
      scansPerDay,
      recentSignups: signupsWithEmail,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
