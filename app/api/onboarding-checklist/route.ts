import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { effectiveProfileId } from "@/lib/supabase/resolve-profile"
import { requireWriteMode } from "@/lib/impersonation"

interface ChecklistState {
  first_scan?: boolean
  review_score?: boolean
  try_rewrite?: boolean
  add_site?: boolean
  invite_team?: boolean
  explore_library?: boolean
  dismissed?: boolean
  tutorial_completed?: boolean
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_checklist")
      .eq("id", profileId)
      .single()

    const checklist: ChecklistState = (profile?.onboarding_checklist as ChecklistState) || {}

    const { count: scanCount } = await supabase
      .from("scans")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)

    const { count: rewriteCount } = await supabase
      .from("scans")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .not("rewritten_text", "is", null)

    const { count: siteCount } = await supabase
      .from("monitored_sites")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)

    const { count: teamCount } = await supabase
      .from("team_members")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)

    const autoDetected = {
      first_scan: (scanCount ?? 0) > 0,
      review_score: (scanCount ?? 0) > 0,
      try_rewrite: (rewriteCount ?? 0) > 0,
      add_site: (siteCount ?? 0) > 0,
      invite_team: (teamCount ?? 0) > 0,
    }

    const merged: ChecklistState = {
      first_scan: checklist.first_scan || autoDetected.first_scan,
      review_score: checklist.review_score || autoDetected.review_score,
      try_rewrite: checklist.try_rewrite || autoDetected.try_rewrite,
      add_site: checklist.add_site || autoDetected.add_site,
      invite_team: checklist.invite_team || autoDetected.invite_team,
      explore_library: checklist.explore_library || false,
      dismissed: checklist.dismissed || false,
      tutorial_completed: checklist.tutorial_completed || false,
    }

    return NextResponse.json({
      checklist: merged,
      totalScans: scanCount ?? 0,
    })
  } catch (error) {
    console.error("Onboarding checklist GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blocked = await requireWriteMode()
    if (blocked) return blocked

    const profileId = await effectiveProfileId(user.id, supabase)

    const body = await request.json()

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_checklist")
      .eq("id", profileId)
      .single()

    const current: ChecklistState = (profile?.onboarding_checklist as ChecklistState) || {}

    const updated = { ...current, ...body }

    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_checklist: updated })
      .eq("id", profileId)

    if (error) {
      console.error("Onboarding checklist update error:", error)
      return NextResponse.json({ error: "Failed to update checklist" }, { status: 500 })
    }

    return NextResponse.json({ checklist: updated })
  } catch (error) {
    console.error("Onboarding checklist PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
