export const maxDuration = 300

import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { enrichActions } from "@/lib/enforcement-enrichment"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const serviceClient = createServiceClient()
  try {
    const result = await enrichActions(serviceClient, 50)
    return NextResponse.json(result)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "enrichment failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
