export interface CompareFaq {
  q: string
  a: string
}

export interface CompareFeatureRow {
  feature: string
  detail?: string
  us: true | false | string
  them: true | false | string
}

export interface CompareUseCase {
  scenario: string
  winner: "us" | "them" | "both"
  recommendation: string
}

export interface CompareStrength {
  title: string
  body: string
}

export interface CompetitorMeta {
  slug: string
  competitor: string
  competitorLong: string
  categoryLabel: string
  title: string
  description: string
  heroBadge: string
  heroTagline: string
  bottomLine: string
  shortVerdict: string
  theirStrengths: CompareStrength[]
  ourStrengths: CompareStrength[]
  honestLimitations: string[]
  useCases: CompareUseCase[]
  featureMatrix: CompareFeatureRow[]
  pricing: {
    us: { label: string; price: string; sub: string }
    them: { label: string; price: string; sub: string }
  }
  faqs: CompareFaq[]
  relatedBlogSlugs?: string[]
  keywords: string[]
}
