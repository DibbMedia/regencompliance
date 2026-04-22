import type { CompetitorMeta } from "./types"
import { meta as chatgpt } from "./data/chatgpt"
import { meta as jasper } from "./data/jasper"
import { meta as grammarly } from "./data/grammarly"
import { meta as copyAi } from "./data/copy-ai"
import { meta as healthcareAttorney } from "./data/healthcare-attorney"
import { meta as manualAudit } from "./data/manual-audit"

export const COMPETITORS: CompetitorMeta[] = [
  chatgpt,
  jasper,
  grammarly,
  copyAi,
  healthcareAttorney,
  manualAudit,
]

export function getCompetitorBySlug(slug: string): CompetitorMeta | undefined {
  return COMPETITORS.find((c) => c.slug === slug)
}

export function getRelatedCompetitors(slug: string, limit = 3): CompetitorMeta[] {
  return COMPETITORS.filter((c) => c.slug !== slug).slice(0, limit)
}
