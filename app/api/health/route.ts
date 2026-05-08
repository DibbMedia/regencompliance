import { NextResponse } from "next/server"
import { timingSafeEqual } from "node:crypto"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const deep = searchParams.get("deep") === "true"

  const health: Record<string, unknown> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    // Short commit SHA of the deployed build, or "dev" locally. Lets you
    // verify at a glance which commit prod is actually running.
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev",
  }

  if (deep) {
    // Deep probe requires cron secret to prevent info disclosure.
    // Constant-time compare so a side-channel can't reveal CRON_SECRET byte-by-byte.
    const authHeader = request.headers.get("authorization")
    const expected = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : null
    if (
      !expected ||
      !authHeader ||
      Buffer.byteLength(authHeader) !== Buffer.byteLength(expected) ||
      !timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
    ) {
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
