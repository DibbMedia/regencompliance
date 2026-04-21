import type { BlogPostModule } from "./types"
import FdaWarningLettersBody, {
  meta as fdaWarningLettersMeta,
} from "./posts/fda-warning-letters-2026"
import FtcSettlementBody, {
  meta as ftcSettlementMeta,
} from "./posts/ftc-stem-cell-settlement"
import StructureFunctionBody, {
  meta as structureFunctionMeta,
} from "./posts/structure-function-vs-disease-claims"
import BannedWordsBody, {
  meta as bannedWordsMeta,
} from "./posts/banned-words-healthcare-marketing-2026"
import AuditFrameworkBody, {
  meta as auditFrameworkMeta,
} from "./posts/healthcare-website-compliance-audit-framework"
import MedSpaBody, {
  meta as medSpaMeta,
} from "./posts/med-spa-marketing-compliance-risk"
import StemCellBody, {
  meta as stemCellMeta,
} from "./posts/stem-cell-marketing-costly-phrases"
import Glp1Body, {
  meta as glp1Meta,
} from "./posts/glp-1-semaglutide-marketing-compliance"
import BeforeAfterBody, {
  meta as beforeAfterMeta,
} from "./posts/before-after-photos-compliance"
import TestimonialBody, {
  meta as testimonialMeta,
} from "./posts/healthcare-testimonial-compliance"

export const POSTS: BlogPostModule[] = [
  { meta: fdaWarningLettersMeta, Body: FdaWarningLettersBody },
  { meta: ftcSettlementMeta, Body: FtcSettlementBody },
  { meta: structureFunctionMeta, Body: StructureFunctionBody },
  { meta: bannedWordsMeta, Body: BannedWordsBody },
  { meta: auditFrameworkMeta, Body: AuditFrameworkBody },
  { meta: medSpaMeta, Body: MedSpaBody },
  { meta: stemCellMeta, Body: StemCellBody },
  { meta: glp1Meta, Body: Glp1Body },
  { meta: beforeAfterMeta, Body: BeforeAfterBody },
  { meta: testimonialMeta, Body: TestimonialBody },
]

export const POSTS_SORTED = [...POSTS].sort(
  (a, b) => +new Date(b.meta.date) - +new Date(a.meta.date),
)

export function getPostBySlug(slug: string): BlogPostModule | undefined {
  return POSTS.find((p) => p.meta.slug === slug)
}

export function getRelated(slug: string, limit = 3) {
  return POSTS_SORTED.filter((p) => p.meta.slug !== slug)
    .slice(0, limit)
    .map((p) => ({
      slug: p.meta.slug,
      title: p.meta.title,
      excerpt: p.meta.excerpt,
    }))
}
