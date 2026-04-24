/**
 * API cost tracking for Claude usage.
 * Tracks input/output tokens and estimated costs per API call.
 * Non-blocking - errors are caught silently to never break the main flow.
 */
import type { SupabaseClient } from "@supabase/supabase-js"

export interface ApiUsageRecord {
  user_id: string
  endpoint: string
  model: string
  input_tokens: number
  output_tokens: number
  estimated_cost_cents: number
  created_at: string
}

// Cost per million tokens in cents (approximate)
const COSTS: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 100, output: 500 },
  "claude-haiku-4-5": { input: 100, output: 500 },
  "claude-sonnet-4-20250514": { input: 300, output: 1500 },
  "claude-sonnet-4-5-20250929": { input: 300, output: 1500 },
  "claude-sonnet-4-5": { input: 300, output: 1500 },
  "claude-sonnet-4-6": { input: 300, output: 1500 },
  "claude-opus-4-5-20251101": { input: 1500, output: 7500 },
  "claude-opus-4-5": { input: 1500, output: 7500 },
  "claude-opus-4-6": { input: 1500, output: 7500 },
}

const DEFAULT_RATES = { input: 100, output: 500 }

export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const rates = COSTS[model] || DEFAULT_RATES
  return Math.round((inputTokens * rates.input + outputTokens * rates.output) / 1_000_000)
}

export function trackApiUsage(
  supabase: SupabaseClient,
  userId: string,
  endpoint: string,
  model: string,
  response: { usage?: { input_tokens?: number; output_tokens?: number } }
) {
  const inputTokens = response.usage?.input_tokens || 0
  const outputTokens = response.usage?.output_tokens || 0
  const costCents = estimateCost(model, inputTokens, outputTokens)

  // Fire and forget - never block the main request. Supabase's builder
  // returns PromiseLike (no .catch), so wrap in an async IIFE to handle
  // both resolved errors (via { error }) and rejections uniformly.
  void (async () => {
    try {
      const { error } = await supabase.from("api_usage").insert({
        user_id: userId,
        endpoint,
        model,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        estimated_cost_cents: costCents,
      })
      if (error) console.error("[API Cost] Failed to track:", error)
    } catch (e) {
      console.error("[API Cost] Failed to track:", e)
    }
  })()
}
