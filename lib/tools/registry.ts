import type { ToolMeta } from "./types"
import { meta as scanner } from "./data/scanner"
import { meta as aiRewriter } from "./data/ai-rewriter"
import { meta as auditTrail } from "./data/audit-trail"
import { meta as complianceLibrary } from "./data/compliance-library"
import { meta as enforcementAlerts } from "./data/enforcement-alerts"

export const TOOLS: ToolMeta[] = [
  scanner,
  aiRewriter,
  auditTrail,
  complianceLibrary,
  enforcementAlerts,
]

export function getToolBySlug(slug: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.slug === slug)
}

export function getRelatedTools(slug: string, limit = 3): ToolMeta[] {
  const tool = getToolBySlug(slug)
  if (!tool) return []
  const relatedSlugs = tool.relatedToolSlugs ?? []
  const explicit = relatedSlugs
    .map((s) => getToolBySlug(s))
    .filter((t): t is ToolMeta => t !== undefined)
  if (explicit.length >= limit) return explicit.slice(0, limit)
  const fillers = TOOLS.filter(
    (t) => t.slug !== slug && !relatedSlugs.includes(t.slug),
  ).slice(0, limit - explicit.length)
  return [...explicit, ...fillers]
}
