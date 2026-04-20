/**
 * Daily AI spend kill-switch.
 *
 * Sums today's `api_usage.estimated_cost_cents` across the whole platform
 * and throws if it exceeds AI_SPEND_DAILY_CAP_CENTS. Disabled if the env
 * var is unset or non-positive — opt-in.
 *
 * Called from `lib/anthropic.ts`, so every `anthropic.messages.create`
 * call gets checked. No per-route wiring required.
 *
 * Fails open on DB error to avoid a transient Supabase hiccup taking down
 * the whole scanner. The spend is still bounded by each user's rate limits.
 */
import { createServiceClient } from "@/lib/supabase/server"

export class AiSpendCapError extends Error {
  constructor(spentCents: number, capCents: number) {
    super(
      `Daily AI spend cap reached: $${(spentCents / 100).toFixed(2)} of $${(capCents / 100).toFixed(2)}. Scanning will resume tomorrow.`,
    )
    this.name = "AiSpendCapError"
  }
}

export async function assertAiSpendAllowed(): Promise<void> {
  const capCents = Number(process.env.AI_SPEND_DAILY_CAP_CENTS)
  if (!Number.isFinite(capCents) || capCents <= 0) return

  try {
    const svc = createServiceClient()
    const startOfDay = new Date()
    startOfDay.setUTCHours(0, 0, 0, 0)

    const { data, error } = await svc
      .from("api_usage")
      .select("estimated_cost_cents")
      .gte("created_at", startOfDay.toISOString())

    if (error) {
      console.error("[AI Spend Guard] lookup failed, failing open:", error)
      return
    }

    const spentCents = (data ?? []).reduce(
      (sum, row) => sum + (row.estimated_cost_cents ?? 0),
      0,
    )

    if (spentCents >= capCents) {
      console.warn(
        `[AI Spend Guard] Daily cap hit: ${spentCents} / ${capCents} cents`,
      )
      throw new AiSpendCapError(spentCents, capCents)
    }
  } catch (err) {
    if (err instanceof AiSpendCapError) throw err
    console.error("[AI Spend Guard] unexpected error, failing open:", err)
  }
}
