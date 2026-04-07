import { ImageResponse } from "next/og"

export const alt = "RegenCompliance — FDA/FTC Compliance Scanner"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          position: "relative",
          overflow: "hidden",
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
              "linear-gradient(rgba(85,224,57,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(85,224,57,0.06) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Green glow top */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            width: "600px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(85,224,57,0.15) 0%, transparent 70%)",
            transform: "translateX(-50%)",
            display: "flex",
          }}
        />

        {/* Shield icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            backgroundColor: "rgba(85,224,57,0.1)",
            border: "2px solid rgba(85,224,57,0.2)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              color: "#55E039",
            }}
          >
            {/* Simple shield shape using text */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#55E039"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
        </div>

        {/* Brand text */}
        <div
          style={{
            display: "flex",
            fontSize: "56px",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "white",
            marginBottom: "12px",
          }}
        >
          Regen
          <span style={{ color: "#55E039" }}>Compliance</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: "24px",
            color: "rgba(255,255,255,0.6)",
            marginBottom: "32px",
            maxWidth: "700px",
            textAlign: "center",
          }}
        >
          FDA/FTC Compliance Scanner for Regenerative Medicine
        </div>

        {/* Beta badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(85,224,57,0.1)",
            border: "1px solid rgba(85,224,57,0.25)",
            borderRadius: "999px",
            padding: "10px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "18px",
              fontWeight: 700,
              color: "#55E039",
            }}
          >
            $297 Lifetime Beta Access
          </div>
        </div>

        {/* Bottom bar */}
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

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            display: "flex",
            fontSize: "16px",
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.05em",
          }}
        >
          compliance.regenportal.com
        </div>
      </div>
    ),
    { ...size }
  )
}
