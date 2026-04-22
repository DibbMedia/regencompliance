export interface SpecialtyFaq {
  q: string
  a: string
}

export interface SpecialtyEnforcementExample {
  title: string
  body: string
}

export interface SpecialtyBannedPhrase {
  phrase: string
  why: string
  alternative: string
  risk: "HIGH" | "MEDIUM" | "LOW"
}

export interface SpecialtyCatch {
  title: string
  body: string
}

export interface SpecialtyCaseStudy {
  title: string
  before: string
  after: string
  outcome: string
}

export interface SpecialtyMeta {
  slug: string
  specialty: string
  specialtyLong: string
  title: string
  description: string
  heroBadge: string
  heroTagline: string
  riskSummary: string
  enforcementExamples: SpecialtyEnforcementExample[]
  bannedPhrases: SpecialtyBannedPhrase[]
  commonCatches: SpecialtyCatch[]
  caseStudy: SpecialtyCaseStudy
  uniqueValue: string
  whoThisIsFor: string[]
  faqs: SpecialtyFaq[]
  relatedBlogSlugs?: string[]
  keywords: string[]
}
