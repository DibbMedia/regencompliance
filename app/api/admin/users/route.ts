import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"

export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) return auth.error
    const { serviceClient } = auth

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50)
    const search = searchParams.get("search") || ""

    let query = serviceClient
      .from("profiles")
      .select("id, clinic_name, subscription_status, created_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (search) {
      query = query.ilike("clinic_name", `%${search}%`)
    }

    const { data: profiles, count, error } = await query

    if (error) {
      console.error("Admin users fetch error:", error)
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      )
    }

    // Get scan counts per profile
    const profileIds = (profiles || []).map((p) => p.id)
    const scanCounts: Record<string, number> = {}

    if (profileIds.length > 0) {
      for (const pid of profileIds) {
        const { count: scanCount } = await serviceClient
          .from("scans")
          .select("*", { count: "exact", head: true })
          .eq("profile_id", pid)
        scanCounts[pid] = scanCount || 0
      }
    }

    // Resolve emails
    const usersWithEmail = []
    for (const profile of profiles || []) {
      const {
        data: { user },
      } = await serviceClient.auth.admin.getUserById(profile.id)
      usersWithEmail.push({
        ...profile,
        email: user?.email || "unknown",
        scan_count: scanCounts[profile.id] || 0,
      })
    }

    // If searching by email and no clinic_name results, try email search
    if (search && usersWithEmail.length === 0) {
      const {
        data: { users: authUsers },
      } = await serviceClient.auth.admin.listUsers({ perPage: 100 })

      const matchingIds = (authUsers || [])
        .filter((u) => u.email?.toLowerCase().includes(search.toLowerCase()))
        .map((u) => u.id)

      if (matchingIds.length > 0) {
        const { data: emailProfiles, count: emailCount } = await serviceClient
          .from("profiles")
          .select("id, clinic_name, subscription_status, created_at", {
            count: "exact",
          })
          .in("id", matchingIds)
          .order("created_at", { ascending: false })
          .range((page - 1) * limit, page * limit - 1)

        const results = []
        for (const profile of emailProfiles || []) {
          const {
            data: { user },
          } = await serviceClient.auth.admin.getUserById(profile.id)
          const { count: scanCount } = await serviceClient
            .from("scans")
            .select("*", { count: "exact", head: true })
            .eq("profile_id", profile.id)
          results.push({
            ...profile,
            email: user?.email || "unknown",
            scan_count: scanCount || 0,
          })
        }

        return NextResponse.json({
          users: results,
          total: emailCount || 0,
          page,
          limit,
          totalPages: Math.ceil((emailCount || 0) / limit),
        })
      }
    }

    return NextResponse.json({
      users: usersWithEmail,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
