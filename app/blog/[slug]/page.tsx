import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BlogPostLayout } from "@/components/blog/post-layout"
import { POSTS, getPostBySlug, getRelated } from "@/lib/blog/registry"
import { MARKETING_URL } from "@/lib/site-url"
import {
  JsonLd,
  buildArticleSchema,
  buildBreadcrumbSchema,
} from "@/lib/schema"

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

  const canonical = `${MARKETING_URL}/blog/${post.meta.slug}`
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

  const canonical = `${MARKETING_URL}/blog/${meta.slug}`
  const articleSchema = buildArticleSchema({
    title: meta.title,
    description: meta.description,
    slug: meta.slug,
    datePublished: meta.date,
    dateModified: meta.updated,
    authorName: meta.author.name,
    keywords: meta.keywords,
  })

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Blog", url: `${MARKETING_URL}/blog` },
    { name: meta.title, url: canonical },
  ])

  return (
    <>
      <JsonLd schema={[articleSchema, breadcrumbSchema]} />
      {meta.extraSchemas?.map((schema, i) => (
        <JsonLd key={i} schema={schema} />
      ))}
      <BlogPostLayout meta={meta} related={related}>
        <Body />
      </BlogPostLayout>
    </>
  )
}
