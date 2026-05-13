// Admin users list.
//
// Wave 2A (encryption rollout, see docs/user-level-encryption-plan.md §12.6):
// `profiles.clinic_name` is encrypted under the user's per-user DEK, so the
// previous `.ilike("clinic_name", ...)` search has been REMOVED. Admin
// search now pivots to `auth.users.email` (via the existing
// find_auth_user_id_by_email RPC / listUsers fallback). This is the
// documented UX shift in plan §12.6; clinic-name search will not return
// after the cutover.
import { NextResponse } from "next/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import { verifyAdmin } from "@/lib/admin"
import { adminSearchSchema } from "@/lib/validations"
import { decryptProfileRow, type ProfileEncryptedRow } from "@/lib/repos/profiles"
import { withCryptoRequestScope } from "@/lib/crypto"

interface ProfileRow {
  id: string
  clinic_name: string | null
  subscription_status: string | null
  created_at: string
}

// Decrypt a slice of the encrypted-row shape (the columns we actually select
// here). We do this inline rather than calling the full `decryptProfileRow`
// because the admin list only needs `id, clinic_name, subscription_status,
// created_at` - the repo full-row select would pull every column.
function decryptListedProfile(row: {
  id: string
  clinic_name_enc: string | null
  clinic_name: string | null
  subscription_status: string | null
  created_at: string
}): ProfileRow {
  // Reuse the repo's decrypt path via a synthesized minimal row. The repo's
  // decrypt function pulls only the columns it needs (clinic_name_enc /
  // legacy clinic_name) so the rest can be no-op defaults.
  const synthesized: ProfileEncryptedRow = {
    id: row.id,
    clinic_name_enc: row.clinic_name_enc,
    treatments_enc: null,
    clinic_name: row.clinic_name,
    treatments: null,
    logo_url: null,
    subscription_status: (row.subscription_status as ProfileEncryptedRow["subscription_status"]) ?? "inactive",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    is_beta_subscriber: false,
    beta_enrolled_at: null,
    cancelled_at: null,
    onboarding_complete: false,
    theme_preference: "system",
    badge_id: null,
    created_at: row.created_at,
    updated_at: row.created_at,
  }
  const decrypted = decryptProfileRow(row.id, synthesized)
  return {
    id: row.id,
    clinic_name: decrypted.clinic_name,
    subscription_status: row.subscription_status,
    created_at: row.created_at,
  }
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

    // Search path: clinic-name search is gone, so a non-empty `search` only
    // matches against `auth.users.email`. We resolve emails to user_ids
    // first, then load the matching profile rows. Empty `search` falls
    // through to the normal paginated listing below.
    if (search) {
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

      if (matchingIds.length === 0) {
        return NextResponse.json({
          users: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        })
      }

      let emailQuery = serviceClient
        .from("profiles")
        .select(
          "id, clinic_name_enc, subscription_status, created_at",
          { count: "exact" },
        )
        .in("id", matchingIds)
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (status) {
        emailQuery = emailQuery.eq("subscription_status", status)
      }

      const { data: emailRawProfiles, count: emailCount } = await emailQuery
      const emailProfiles = await withCryptoRequestScope(async () =>
        (emailRawProfiles ?? []).map((r) =>
          decryptListedProfile(r as {
            id: string
            clinic_name_enc: string | null
            clinic_name: string | null
            subscription_status: string | null
            created_at: string
          }),
        ),
      )
      const results = await attachUserMetadata(serviceClient, emailProfiles)

      return NextResponse.json({
        users: results,
        total: emailCount || 0,
        page,
        limit,
        totalPages: Math.ceil((emailCount || 0) / limit),
      })
    }

    let query = serviceClient
      .from("profiles")
      .select(
        // Select ciphertext + legacy plaintext fallback so the in-route
        // decrypt has both during the Wave 2A transition window.
        "id, clinic_name_enc, subscription_status, created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (status) {
      query = query.eq("subscription_status", status)
    }

    const { data: rawProfiles, count, error } = await query

    if (error) {
      console.error("Admin users fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // Decrypt clinic_name on every row using the request-scoped derive cache.
    const profiles = await withCryptoRequestScope(async () =>
      (rawProfiles ?? []).map((r) =>
        decryptListedProfile(r as {
          id: string
          clinic_name_enc: string | null
          clinic_name: string | null
          subscription_status: string | null
          created_at: string
        }),
      ),
    )

    const usersWithEmail = await attachUserMetadata(serviceClient, profiles)

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
    // Wave 2A: clinic_name is encrypted under the new user's per-user DEK.
    // Route the write through the repo so the ciphertext column is the only
    // thing that hits Supabase.
    const { updateProfile } = await import("@/lib/repos/profiles")
    await updateProfile(serviceClient, created.user.id, { clinic_name: clinicName })
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
