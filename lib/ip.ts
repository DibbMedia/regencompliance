export function getClientIp(request: Request): string {
  const vercel = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
  if (vercel) return vercel
  const xff = request.headers.get("x-forwarded-for")
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean)
    if (parts.length > 0) return parts[parts.length - 1]
  }
  const real = request.headers.get("x-real-ip")
  if (real) return real.trim()
  return "unknown"
}
