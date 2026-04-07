import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

const BETA_SEAT_LIMIT = 25

export async function GET() {
  try {
    const supabase = createServiceClient()

    // Count confirmed beta subscribers
    const { count: confirmedCount, error: confirmedError } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_beta_subscriber", true)

    if (confirmedError) {
      console.error("Beta spots count error:", confirmedError)
      return NextResponse.json({ error: "Failed to fetch beta spots" }, { status: 500 })
    }

    // Count unclaimed beta purchases (paid but not yet linked)
    const { count: pendingCount, error: pendingError } = await supabase
      .from("beta_purchases")
      .select("id", { count: "exact", head: true })
      .eq("claimed", false)

    if (pendingError) {
      console.error("Beta pending count error:", pendingError)
      return NextResponse.json({ error: "Failed to fetch beta spots" }, { status: 500 })
    }

    const taken = (confirmedCount ?? 0) + (pendingCount ?? 0)

    return NextResponse.json({
      total: BETA_SEAT_LIMIT,
      taken,
      remaining: Math.max(0, BETA_SEAT_LIMIT - taken),
    })
  } catch (error) {
    console.error("Beta spots error:", error)
    return NextResponse.json({ error: "Failed to fetch beta spots" }, { status: 500 })
  }
}
