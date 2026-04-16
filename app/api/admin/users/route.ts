import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import { adminSearchSchema } from "@/lib/validations"

export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) return auth.error
    const { serviceClient } = auth

    const { searchParams } = new URL(request.url)
    const paramsParsed = adminSearchSchema.safeParse({
      search: searchParams.get("search") || "",
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      status: searchParams.get("status") || "",
    })
    if (!paramsParsed.success) {
      return NextResponse.json({ error: paramsParsed.error.issues[0].message }, { status: 400 })
    }

    const { search, page, status } = paramsParsed.data
    const limit = Math.min(paramsParsed.data.limit || 20, 50)

    let query = serviceClient
      .from("profiles")
      .select("id, clinic_name, subscription_status, created_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (status) {
      query = query.eq("subscription_status", status)
    }

    if (search) {
      const escapedSearch = search.replace(/%/g, '\\%').replace(/_/g, '\\_')
      query = query.ilike("clinic_name", `%${escapedSearch}%`)
    }

    const { data: profiles, count, error } = await query

    if (error) {
      console.error("Admin users fetch error:", error)
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      )
    }

    // Get scan counts and last scan date per profile
    const profileIds = (profiles || []).map((p) => p.id)
    const scanInfo: Record<string, { count: number; lastScanAt: string | null }> = {}

    if (profileIds.length > 0) {
      for (const pid of profileIds) {
        const { count: scanCount } = await serviceClient
          .from("scans")
          .select("*", { count: "exact", head: true })
          .eq("profile_id", pid)

        const { data: lastScan } = await serviceClient
          .from("scans")
          .select("created_at")
          .eq("profile_id", pid)
          .order("created_at", { ascending: false })
          .limit(1)

        scanInfo[pid] = {
          count: scanCount || 0,
          lastScanAt: lastScan?.[0]?.created_at || null,
        }
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
        scan_count: scanInfo[profile.id]?.count || 0,
        last_scan_at: scanInfo[profile.id]?.lastScanAt || null,
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
        let emailQuery = serviceClient
          .from("profiles")
          .select("id, clinic_name, subscription_status, created_at", {
            count: "exact",
          })
          .in("id", matchingIds)
          .order("created_at", { ascending: false })
          .range((page - 1) * limit, page * limit - 1)

        if (status) {
          emailQuery = emailQuery.eq("subscription_status", status)
        }

        const { data: emailProfiles, count: emailCount } = await emailQuery

        const results = []
        for (const profile of emailProfiles || []) {
          const {
            data: { user },
          } = await serviceClient.auth.admin.getUserById(profile.id)
          const { count: scanCount } = await serviceClient
            .from("scans")
            .select("*", { count: "exact", head: true })
            .eq("profile_id", profile.id)
          const { data: lastScan } = await serviceClient
            .from("scans")
            .select("created_at")
            .eq("profile_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(1)
          results.push({
            ...profile,
            email: user?.email || "unknown",
            scan_count: scanCount || 0,
            last_scan_at: lastScan?.[0]?.created_at || null,
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

export async function POST(request: Request) {
  const { verifyDeveloperAdmin } = await import("@/lib/admin")
  const { logAudit, getRequestMeta } = await import("@/lib/audit-log")

  const auth = await verifyDeveloperAdmin()
  if ("error" in auth) return auth.error
  const { user, serviceClient } = auth

  const body = await request.json().catch(() => null)
  if (!body?.email) {
    return NextResponse.json({ error: "email required" }, { status: 400 })
  }

  const email = String(body.email).toLowerCase().trim()
  const clinicName = body.clinic_name ? String(body.clinic_name).slice(0, 200) : null
  const sendInvite = body.send_invite !== false

  const { data: created, error: createErr } = await serviceClient.auth.admin.createUser({
    email,
    email_confirm: !sendInvite,
    user_metadata: clinicName ? { clinic_name: clinicName } : {},
  })

  if (createErr || !created?.user) {
    return NextResponse.json(
      { error: createErr?.message ?? "Failed to create user" },
      { status: 400 },
    )
  }

  if (clinicName) {
    await serviceClient
      .from("profiles")
      .update({ clinic_name: clinicName })
      .eq("id", created.user.id)
  }

  let inviteUrl: string | null = null
  if (sendInvite) {
    const { data: linkData } = await serviceClient.auth.admin.generateLink({
      type: "magiclink",
      email,
    })
    inviteUrl = linkData?.properties?.action_link ?? null
  }

  const { ip, userAgent } = getRequestMeta(request)
  logAudit({
    user_id: user.id,
    user_email: user.email,
    action: "admin.user.create",
    resource_type: "user",
    resource_id: created.user.id,
    details: { email, clinic_name: clinicName, sent_invite: sendInvite },
    ip_address: ip,
    user_agent: userAgent,
  })

  return NextResponse.json({
    user: { id: created.user.id, email: created.user.email },
    invite_url: inviteUrl,
  })
}
