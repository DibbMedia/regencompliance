import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const deep = searchParams.get("deep") === "true"

  const health: Record<string, unknown> = {
    status: "ok",
    timestamp: new Date().toISOString(),
  }

  if (deep) {
    // Deep probe requires cron secret to prevent info disclosure
    const authHeader = request.headers.get("authorization")
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const supabase = createServiceClient()
      const start = Date.now()
      const { error } = await supabase.from("compliance_rules").select("id").limit(1)
      health.supabase = {
        status: error ? "error" : "ok",
        latency_ms: Date.now() - start,
      }
    } catch {
      health.supabase = { status: "error" }
    }

    health.status = health.supabase && (health.supabase as Record<string, unknown>).status === "ok" ? "ok" : "degraded"
  }

  return NextResponse.json(health)
}
