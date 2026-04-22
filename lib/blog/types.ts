import type { ComponentType } from "react"

export interface BlogPostMeta {
  slug: string
  title: string
  description: string
  excerpt: string
  date: string
  updated?: string
  readingMinutes: number
  keywords: string[]
  tags: string[]
  author: { name: string; role?: string }
  heroLabel?: string
  /**
   * Optional extra JSON-LD schema blocks (HowTo, FAQPage, etc.) rendered
   * in <head> alongside the default Article + BreadcrumbList schemas.
   */
  extraSchemas?: Array<Record<string, unknown>>
}

export interface BlogPostModule {
  meta: BlogPostMeta
  Body: ComponentType
}
