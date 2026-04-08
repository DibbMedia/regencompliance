/**
 * API cost tracking for Claude usage.
 * Tracks input/output tokens and estimated costs per API call.
 * Non-blocking — errors are caught silently to never break the main flow.
 */

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
  "claude-haiku-4-5-20251001": { input: 100, output: 500 },       // $1/$5 per MTok
  "claude-sonnet-4-5-20250514": { input: 300, output: 1500 },     // $3/$15 per MTok
  "claude-4-sonnet-20250514": { input: 300, output: 1500 },
}

const DEFAULT_RATES = { input: 100, output: 500 }

export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const rates = COSTS[model] || DEFAULT_RATES
  return Math.round((inputTokens * rates.input + outputTokens * rates.output) / 1_000_000)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function trackApiUsage(
  supabase: any,
  userId: string,
  endpoint: string,
  model: string,
  response: { usage?: { input_tokens?: number; output_tokens?: number } }
) {
  const inputTokens = response.usage?.input_tokens || 0
  const outputTokens = response.usage?.output_tokens || 0
  const costCents = estimateCost(model, inputTokens, outputTokens)

  // Fire and forget — never block the main request
  supabase.from("api_usage").insert({
    user_id: userId,
    endpoint,
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    estimated_cost_cents: costCents,
  }).then(() => {}).catch((e: unknown) => console.error("[API Cost] Failed to track:", e))
}
