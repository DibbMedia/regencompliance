import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isValidUUID } from "@/lib/validations"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: action, error } = await supabase
      .from("enforcement_actions")
      .select("*, compliance_rules(*)")
      .eq("id", id)
      .eq("is_published", true)
      .eq("compliance_rules.is_active", true)
      .maybeSingle()

    if (error) {
      console.error("Library detail fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch action" }, { status: 500 })
    }

    if (!action) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ action })
  } catch (error) {
    console.error("Library detail error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
