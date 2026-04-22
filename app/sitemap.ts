import type { MetadataRoute } from "next"
import { POSTS_SORTED } from "@/lib/blog/registry"
import { COMPETITORS } from "@/lib/compare/registry"
import { SPECIALTIES } from "@/lib/specialty/registry"
import { STATES } from "@/lib/state/data"
import { TOOLS } from "@/lib/tools/registry"
import { POSTS_PER_PAGE } from "@/components/blog/blog-index"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://compliance.regenportal.com"
  const now = new Date()

  // Blog pagination (page 1 lives at /blog, pages 2..N at /blog/page/[n])
  const [, ...restPosts] = POSTS_SORTED
  const totalBlogPages = Math.max(
    1,
    Math.ceil(restPosts.length / POSTS_PER_PAGE),
  )

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
      url: `${baseUrl}/how-it-works`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/security`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
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

  const blogPaginationRoutes: MetadataRoute.Sitemap = []
  for (let p = 2; p <= totalBlogPages; p++) {
    blogPaginationRoutes.push({
      url: `${baseUrl}/blog/page/${p}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })
  }

  const toolRoutes: MetadataRoute.Sitemap = TOOLS.map((t) => ({
    url: `${baseUrl}/tools/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }))

  return [
    ...staticRoutes,
    ...blogRoutes,
    ...compareRoutes,
    ...specialtyRoutes,
    ...stateRoutes,
    ...blogPaginationRoutes,
    ...toolRoutes,
  ]
}
