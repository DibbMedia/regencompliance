import { ImageResponse } from "next/og"
import { getPostBySlug, POSTS } from "@/lib/blog/registry"

export const alt = "RegenCompliance blog post"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  return [
    {
      id: slug,
      size,
      alt: post?.meta.title ?? alt,
      contentType,
    },
  ]
}

export async function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.meta.slug }))
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  const title = post?.meta.title ?? "RegenCompliance"
  const readingMinutes = post?.meta.readingMinutes
  const heroLabel = post?.meta.heroLabel ?? "Compliance insights"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0a0a0a",
          position: "relative",
          overflow: "hidden",
          padding: "72px 72px 56px 72px",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(rgba(85,224,57,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(85,224,57,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Corner glow */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(85,224,57,0.18) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #55E039 0%, #3BB82A 100%)",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0a0a0a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "white",
            }}
          >
            Regen
            <span style={{ color: "#55E039" }}>Compliance</span>
          </div>
        </div>

        {/* Category pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "rgba(85,224,57,0.1)",
            border: "1px solid rgba(85,224,57,0.3)",
            borderRadius: "999px",
            padding: "8px 18px",
            marginTop: "56px",
            alignSelf: "flex-start",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "#55E039",
              textTransform: "uppercase",
            }}
          >
            {heroLabel}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: title.length > 80 ? "52px" : title.length > 50 ? "60px" : "68px",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "white",
            marginTop: "28px",
            position: "relative",
            maxWidth: "1060px",
          }}
        >
          {title}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, display: "flex" }} />

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            marginTop: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "20px",
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.02em",
            }}
          >
            compliance.regenportal.com/blog
          </div>
          {readingMinutes != null && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "18px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {readingMinutes} min read
            </div>
          )}
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "4px",
            display: "flex",
            background: "linear-gradient(90deg, transparent, #55E039, transparent)",
          }}
        />
      </div>
    ),
    { ...size },
  )
}
