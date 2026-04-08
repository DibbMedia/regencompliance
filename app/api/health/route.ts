import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const deep = searchParams.get("deep") === "true"

  const health: Record<string, unknown> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev",
  }

  if (deep) {
    // Probe Supabase
    try {
      const supabase = createServiceClient()
      const start = Date.now()
      const { error } = await supabase.from("compliance_rules").select("id").limit(1)
      health.supabase = {
        status: error ? "error" : "ok",
        latency_ms: Date.now() - start,
        error: error?.message || null,
      }
    } catch (e) {
      health.supabase = { status: "error", error: e instanceof Error ? e.message : "unknown" }
    }

    // Probe Anthropic (just check env var exists, don't make a real call)
    health.anthropic = {
      status: process.env.ANTHROPIC_API_KEY ? "configured" : "missing",
    }

    // Probe Stripe
    health.stripe = {
      status: process.env.STRIPE_SECRET_KEY ? "configured" : "missing",
    }

    // Overall status
    const allOk = health.supabase && (health.supabase as Record<string, unknown>).status === "ok"
    health.status = allOk ? "ok" : "degraded"
  }

  return NextResponse.json(health)
}
