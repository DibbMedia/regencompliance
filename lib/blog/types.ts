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
}

export interface BlogPostModule {
  meta: BlogPostMeta
  Body: ComponentType
}
