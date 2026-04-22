import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://compliance.regenportal.com"

  return {
    rules: [
      // Default: allow all indexing except app surfaces
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/onboarding/", "/admin/", "/auth/"],
      },
      // Explicit allow for major AI crawlers - we want to appear in AI answers
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/onboarding/", "/admin/", "/auth/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/onboarding/", "/admin/", "/auth/"],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/onboarding/", "/admin/", "/auth/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/onboarding/", "/admin/", "/auth/"],
      },
      {
        userAgent: "Claude-Web",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/onboarding/", "/admin/", "/auth/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/onboarding/", "/admin/", "/auth/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/onboarding/", "/admin/", "/auth/"],
      },
      {
        userAgent: "Perplexity-User",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/onboarding/", "/admin/", "/auth/"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/onboarding/", "/admin/", "/auth/"],
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/onboarding/", "/admin/", "/auth/"],
      },
      {
        userAgent: "Bytespider",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/onboarding/", "/admin/", "/auth/"],
      },
      {
        userAgent: "CCBot",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/onboarding/", "/admin/", "/auth/"],
      },
      {
        userAgent: "cohere-ai",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/onboarding/", "/admin/", "/auth/"],
      },
      {
        userAgent: "Meta-ExternalAgent",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/onboarding/", "/admin/", "/auth/"],
      },
      {
        userAgent: "FacebookBot",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/onboarding/", "/admin/", "/auth/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
