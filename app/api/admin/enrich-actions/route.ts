export const maxDuration = 300

import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"
import { enrichActions } from "@/lib/enforcement-enrichment"

export async function POST(request: Request) {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error
  const { serviceClient } = auth

  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50)

  try {
    const result = await enrichActions(serviceClient, limit)
    return NextResponse.json(result)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "enrichment failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
