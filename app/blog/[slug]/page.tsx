import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BlogPostLayout } from "@/components/blog/post-layout"
import { POSTS, getPostBySlug, getRelated } from "@/lib/blog/registry"

export async function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.meta.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: "Not found" }

  const canonical = `https://compliance.regenportal.com/blog/${post.meta.slug}`
  return {
    title: post.meta.title,
    description: post.meta.description,
    keywords: post.meta.keywords,
    alternates: { canonical },
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      url: canonical,
      type: "article",
      publishedTime: post.meta.date,
      modifiedTime: post.meta.updated ?? post.meta.date,
      authors: [post.meta.author.name],
      tags: post.meta.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta.title,
      description: post.meta.description,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const { Body, meta } = post
  const related = getRelated(slug)

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    dateModified: meta.updated ?? meta.date,
    author: { "@type": "Organization", name: meta.author.name },
    publisher: {
      "@type": "Organization",
      name: "RegenCompliance",
      url: "https://compliance.regenportal.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://compliance.regenportal.com/blog/${meta.slug}`,
    },
    keywords: meta.keywords.join(", "),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BlogPostLayout meta={meta} related={related}>
        <Body />
      </BlogPostLayout>
    </>
  )
}
