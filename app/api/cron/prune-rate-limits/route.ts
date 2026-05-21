export const maxDuration = 60

import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { isCronAuthorized } from "@/lib/cron-auth"
import { logAudit } from "@/lib/audit-log"

// Daily prune of expired `rate_limits` rows. Replaces the operator-applied
// pg_cron job documented in `docs/ops/RATE-LIMITS-PG-CRON.sql` so the table
// self-prunes via Vercel cron without requiring SQL setup.
//
// The 1-hour grace on the cutoff is deliberate: an operator debugging a
// rate-limit issue can still see recently-expired rows for ~1h after they
// fired, before this job sweeps them.
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (!isCronAuthorized(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const startedAt = Date.now()
  const supabase = createServiceClient()
  // Compute the cutoff in JS so the value is stable across the round-trip
  // (avoids skew between PG `now()` and the audit-log timestamp).
  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  try {
    // `.select("id")` after `.delete()` causes PostgREST to return the
    // deleted rows so we can count them deterministically. Without it the
    // response body is empty and we'd have to trust `count: "exact"`, which
    // behaves inconsistently under service-role RLS.
    const { data, error } = await supabase
      .from("rate_limits")
      .delete()
      .lt("expires_at", cutoff)
      .select("id")

    if (error) throw error

    const pruned = data?.length ?? 0
    const tookMs = Date.now() - startedAt

    logAudit({
      action: "cron.prune_rate_limits",
      status: "success",
      details: { pruned, took_ms: tookMs },
    })

    return NextResponse.json({ pruned })
  } catch (err) {
    const tookMs = Date.now() - startedAt
    // Supabase returns a `PostgrestError`-shaped object (`{ message, code, … }`),
    // NOT an `Error` instance — `instanceof Error` would lose the message.
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err !== null && "message" in err && typeof (err as { message: unknown }).message === "string"
          ? (err as { message: string }).message
          : String(err)

    logAudit({
      action: "cron.prune_rate_limits",
      status: "failure",
      details: { error: message, took_ms: tookMs },
    })

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
