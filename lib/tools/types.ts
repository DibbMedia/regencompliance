export interface ToolCapability {
  title: string
  body: string
}

export interface ToolHowItWorks {
  title: string
  body: string
}

export interface ToolUseCase {
  title: string
  body: string
}

export interface ToolFaq {
  q: string
  a: string
}

export interface ToolMeta {
  slug: string
  name: string
  category: string
  title: string
  description: string
  heroBadge: string
  heroTagline: string
  shortVerdict: string
  whatItIs: string
  capabilities: ToolCapability[]
  howItWorks: ToolHowItWorks[]
  useCases: ToolUseCase[]
  included: string[]
  whatItIsnt: string[]
  faqs: ToolFaq[]
  relatedBlogSlugs?: string[]
  relatedToolSlugs?: string[]
  keywords: string[]
}
