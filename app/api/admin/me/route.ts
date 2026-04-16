import { NextResponse } from "next/server"
import { verifyAdmin } from "@/lib/admin"

export async function GET() {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth.error
  return NextResponse.json({
    id: auth.user.id,
    email: auth.user.email,
    role: auth.role,
  })
}
