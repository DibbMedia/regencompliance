import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  // One-time migration endpoint — delete after use
  const secret = request.headers.get("x-migrate-secret")
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Step 1: Create the table using individual insert to test
  // Supabase JS can't run DDL, so we use the SQL via fetch to the management API
  // Instead, we'll use the Supabase SQL HTTP API
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const sql = `
    CREATE TABLE IF NOT EXISTS notification_reads (
      notification_id uuid REFERENCES notifications(id) ON DELETE CASCADE,
      user_id uuid NOT NULL,
      read_at timestamptz DEFAULT now(),
      PRIMARY KEY (notification_id, user_id)
    );

    ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_reads' AND policyname = 'Users can view own reads') THEN
        EXECUTE 'CREATE POLICY "Users can view own reads" ON notification_reads FOR SELECT USING (user_id = auth.uid())';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_reads' AND policyname = 'Users can insert own reads') THEN
        EXECUTE 'CREATE POLICY "Users can insert own reads" ON notification_reads FOR INSERT WITH CHECK (user_id = auth.uid())';
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS idx_notification_reads_user ON notification_reads(user_id);
  `

  // Use the Supabase pg-meta SQL endpoint
  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  })

  if (!res.ok) {
    // Fallback: try the older endpoint
    const res2 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_raw_query`, {
      method: "POST",
      headers: {
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify({ sql }),
    })

    if (!res2.ok) {
      const text2 = await res2.text()
      return NextResponse.json({
        error: "Both migration methods failed",
        pg_query_status: res.status,
        pg_query_body: await res.text().catch(() => "n/a"),
        rpc_status: res2.status,
        rpc_body: text2.slice(0, 500),
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, method: "rpc" })
  }

  const result = await res.json().catch(() => ({}))

  // Verify table exists
  const { data, error } = await supabase.from("notification_reads").select("*").limit(1)

  return NextResponse.json({
    success: true,
    method: "pg_query",
    result,
    verification: error ? `Error: ${error.message}` : `Table exists, ${data?.length ?? 0} rows`,
  })
}
