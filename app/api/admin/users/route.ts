import { NextResponse } from "next/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import { verifyAdmin } from "@/lib/admin"
import { adminSearchSchema } from "@/lib/validations"

interface ProfileRow {
  id: string
  clinic_name: string | null
  subscription_status: string | null
  created_at: string
}

interface ScanInfo {
  count: number
  lastScanAt: string | null
}

/**
 * Build the {scan_count, last_scan_at, email} attachments for a page of profiles.
 *
 * Pre-2026-05-05 this ran 3 queries per profile sequentially: count, last
 * scan, getUserById. With page sizes up to 50 that meant ~150 round trips on
 * the hot admin path, with auth.admin lookups adding the most latency. Now
 * we batch:
 *   - All scans for the page in one ordered query, aggregated in JS.
 *   - All getUserById calls in parallel via Promise.all.
 */
async function attachUserMetadata(
  serviceClient: SupabaseClient,
  profiles: ProfileRow[],
) {
  const profileIds = profiles.map((p) => p.id)
  if (profileIds.length === 0) return []

  const [scanRowsResult, emailEntries] = await Promise.all([
    serviceClient
      .from("scans")
      .select("profile_id, created_at")
      .in("profile_id", profileIds)
      .order("created_at", { ascending: false }),
    Promise.all(
      profileIds.map(async (id) => {
        const { data } = await serviceClient.auth.admin.getUserById(id)
        return [id, data?.user?.email ?? "unknown"] as const
      }),
    ),
  ])

  const scanInfo: Record<string, ScanInfo> = {}
  for (const id of profileIds) scanInfo[id] = { count: 0, lastScanAt: null }
  for (const row of scanRowsResult.data ?? []) {
    const info = scanInfo[row.profile_id]
    if (!info) continue
    info.count++
    // First row per profile is the newest (we ordered desc).
    if (!info.lastScanAt) info.lastScanAt = row.created_at
  }

  const emailMap = new Map(emailEntries)
  return profiles.map((p) => ({
    ...p,
    email: emailMap.get(p.id) ?? "unknown",
    scan_count: scanInfo[p.id]?.count ?? 0,
    last_scan_at: scanInfo[p.id]?.lastScanAt ?? null,
  }))
}

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
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    const usersWithEmail = await attachUserMetadata(serviceClient, (profiles ?? []) as ProfileRow[])

    // Email-search fallback when clinic_name search returned nothing.
    if (search && usersWithEmail.length === 0) {
      const matchingIds: string[] = []

      // Exact-email lookup via the indexed RPC from migration 030. This is
      // the common case when the admin pastes a full email and avoids the
      // listUsers 100-row ceiling that silently broke search past 100 users.
      if (search.includes("@")) {
        const { data: exactId } = await serviceClient.rpc(
          "find_auth_user_id_by_email",
          { p_email: search.trim() },
        )
        if (typeof exactId === "string" && exactId.length > 0) {
          matchingIds.push(exactId)
        }
      }

      // Fall back to a substring scan of the first page for partial queries.
      // Documented limitation: only sees the most-recent 200 auth users.
      // For deployments past this scale, add a substring RPC against
      // auth.users with a trigram index.
      if (matchingIds.length === 0) {
        const {
          data: { users: authUsers },
        } = await serviceClient.auth.admin.listUsers({ perPage: 200 })
        for (const u of authUsers || []) {
          if (u.email?.toLowerCase().includes(search.toLowerCase())) {
            matchingIds.push(u.id)
          }
        }
      }

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
        const results = await attachUserMetadata(
          serviceClient,
          (emailProfiles ?? []) as ProfileRow[],
        )

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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
