import Anthropic from "@anthropic-ai/sdk"
import { assertAiSpendAllowed } from "@/lib/ai-spend-guard"

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const originalCreate = anthropic.messages.create.bind(anthropic.messages)
// Global spend-cap guard — every messages.create call goes through the
// kill-switch defined in lib/ai-spend-guard.ts. Disabled unless
// AI_SPEND_DAILY_CAP_CENTS is set in env.
// @ts-expect-error monkey-patch of SDK method for transparent wrapping
anthropic.messages.create = async (...args: unknown[]) => {
  await assertAiSpendAllowed()
  // @ts-expect-error pass-through to original SDK method
  return originalCreate(...args)
}
