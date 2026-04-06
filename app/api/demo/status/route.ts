import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const MAX_DEMO_SCANS = 3
const COOKIE_MAX_AGE = 90 * 24 * 60 * 60 // 90 days in seconds

interface DemoCookie {
  scans_used: number
  started_at: string
}

export async function GET() {
  const cookieStore = await cookies()
  const demoCookie = cookieStore.get("regen_demo")

  if (!demoCookie?.value) {
    return NextResponse.json({
      scans_used: 0,
      max_scans: MAX_DEMO_SCANS,
      expired: false,
    })
  }

  try {
    const data: DemoCookie = JSON.parse(demoCookie.value)
    return NextResponse.json({
      scans_used: data.scans_used,
      max_scans: MAX_DEMO_SCANS,
      expired: data.scans_used >= MAX_DEMO_SCANS,
    })
  } catch {
    return NextResponse.json({
      scans_used: 0,
      max_scans: MAX_DEMO_SCANS,
      expired: false,
    })
  }
}
