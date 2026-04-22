import type { MetadataRoute } from "next"
import { POSTS_SORTED } from "@/lib/blog/registry"
import { COMPETITORS } from "@/lib/compare/registry"
import { SPECIALTIES } from "@/lib/specialty/registry"
import { STATES } from "@/lib/state/data"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://compliance.regenportal.com"
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/demo`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/for`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/glossary`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/state`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  const blogRoutes: MetadataRoute.Sitemap = POSTS_SORTED.map(({ meta }) => ({
    url: `${baseUrl}/blog/${meta.slug}`,
    lastModified: new Date(meta.updated ?? meta.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const compareRoutes: MetadataRoute.Sitemap = COMPETITORS.map((c) => ({
    url: `${baseUrl}/vs/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }))

  const specialtyRoutes: MetadataRoute.Sitemap = SPECIALTIES.map((s) => ({
    url: `${baseUrl}/for/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }))

  const stateRoutes: MetadataRoute.Sitemap = STATES.map((s) => ({
    url: `${baseUrl}/state/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [
    ...staticRoutes,
    ...blogRoutes,
    ...compareRoutes,
    ...specialtyRoutes,
    ...stateRoutes,
  ]
}
