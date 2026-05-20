// Weekly state-source enforcement refresh.
//
// Schedule: vercel.json runs this at "0 6 * * 0" - 06:00 UTC every Sunday.
// In US Central time that's 1am CDT during DST (Mar-Nov) and midnight CST
// during standard time (Nov-Mar). The window is intentionally off-hours
// in either case; the DST drift is one hour and is acceptable.
//
// Pattern mirrors app/api/cron/scrape-rules/route.ts:
//  - maxDuration = 300 (Vercel function budget).
//  - Cron auth via lib/cron-auth.ts isCronAuthorized.
//  - Service-role Supabase client for compliance_rules + enforcement_actions
//    writes (RLS does not apply to service-role).
//  - 502 when the pipeline itself throws (no per-state results survive).
//  - 200 with per-state errors in the JSON when only some states erred.
//  - 500 when the outer handler crashes for any other reason.

export const maxDuration = 300

import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { isCronAuthorized } from "@/lib/cron-auth"
import { runStateRulesPipeline } from "@/lib/compliance/state-pipeline"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (!isCronAuthorized(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const startedAt = Date.now()

  try {
    const supabase = createServiceClient()

    let result
    try {
      result = await runStateRulesPipeline(supabase)
    } catch (err) {
      // The pipeline catches per-state and per-link errors internally; if
      // it still threw, something fundamental broke (Supabase unusable,
      // out-of-memory, etc.). Surface a 502 so the cron is retried instead
      // of being marked successful.
      const msg = err instanceof Error ? err.message : String(err)
      console.error("[cron/weekly-refresh] pipeline threw:", msg)
      return NextResponse.json(
        { ok: false, error: msg },
        { status: 502 },
      )
    }

    const durationMs = Date.now() - startedAt
    console.log(
      "[cron/weekly-refresh] complete states=" + result.perState.length +
        " details=" + result.totalDetailsProcessed +
        " new_rules=" + result.totalNewRules +
        " ms=" + durationMs,
    )

    return NextResponse.json(
      {
        ok: true,
        ...result,
        duration_ms: durationMs,
      },
      { status: 200 },
    )
  } catch (err) {
    // Defensive outer catch - any unexpected throw outside the pipeline
    // (cron auth, JSON serialization, etc.) returns 500.
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[cron/weekly-refresh] outer error:", msg)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
