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

export const POSTS: BlogPostModule[] = [
  { meta: fdaWarningLettersMeta, Body: FdaWarningLettersBody },
  { meta: ftcSettlementMeta, Body: FtcSettlementBody },
  { meta: structureFunctionMeta, Body: StructureFunctionBody },
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
