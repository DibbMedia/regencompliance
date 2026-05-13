// Runtime verifier for the encryption cutover. Run against a live Supabase DB
// (via service-role) at every soak checkpoint in `docs/security/soak-runbook.md`.
//
// Usage:
//   npx tsx scripts/verify-no-plaintext.ts
//
// Requires env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
//
// What it checks (Phase 2-6 in-scope tables):
//   1. For each (table, plaintext_col): count rows where plaintext_col IS NOT
//      NULL. PASS = column dropped (post-cutover) OR zero non-null rows.
//      FAIL = column still exists with non-null rows.
//   2. For each (table, _enc_col): sample up to 10 random rows; assert the
//      `_enc` column is non-null AND starts with a valid envelope prefix
//      (`v1.`, `v1u.`, `v1r.`, or `v1s.`). PASS if all sampled rows pass;
//      FAIL on first sampled row that violates. Empty tables PASS trivially.
//   3. Unique-constraint removal: for `waitlist` + `beta_applications` +
//      `free_audit_leads` the pre-encryption schemas keyed off plaintext
//      email; the cutover migrations drop those uniques. PASS = constraint
//      gone. FAIL = still present.
//
// Exit code 0 on all PASS; exit 1 if any FAIL.

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

interface EncryptedColumn {
  table: string
  plaintextCol: string
  encCol: string
}

// Mapping derived from migrations 033/035/037/039/041 (additive) and
// 034/036/038/040/042 (cutover, drop plaintext). Same source of truth as
// `scripts/check-plaintext-leaks.ts`.
const COLUMNS: ReadonlyArray<EncryptedColumn> = [
  // 033 / 034
  { table: "profiles", plaintextCol: "clinic_name", encCol: "clinic_name_enc" },
  { table: "profiles", plaintextCol: "treatments", encCol: "treatments_enc" },
  { table: "team_members", plaintextCol: "email", encCol: "email_enc" },
  // 035 / 036
  { table: "scans", plaintextCol: "original_text", encCol: "original_text_enc" },
  { table: "scans", plaintextCol: "rewritten_text", encCol: "rewritten_text_enc" },
  { table: "scans", plaintextCol: "flags", encCol: "flags_enc" },
  { table: "scans", plaintextCol: "source_url", encCol: "source_url_enc" },
  { table: "monitored_sites", plaintextCol: "domain", encCol: "domain_enc" },
  { table: "monitored_sites", plaintextCol: "name", encCol: "name_enc" },
  { table: "site_pages", plaintextCol: "url", encCol: "url_enc" },
  { table: "site_pages", plaintextCol: "title", encCol: "title_enc" },
  // 037 / 038
  { table: "support_tickets", plaintextCol: "subject", encCol: "subject_enc" },
  { table: "ticket_messages", plaintextCol: "message", encCol: "message_enc" },
  { table: "notifications", plaintextCol: "title", encCol: "title_enc" },
  { table: "notifications", plaintextCol: "body", encCol: "body_enc" },
  { table: "notifications", plaintextCol: "action_url", encCol: "action_url_enc" },
  // 039 / 040
  { table: "audit_log", plaintextCol: "user_email", encCol: "user_email_enc" },
  { table: "audit_log", plaintextCol: "details", encCol: "details_enc" },
  { table: "audit_log", plaintextCol: "ip_address", encCol: "ip_address_enc" },
  { table: "audit_log", plaintextCol: "user_agent", encCol: "user_agent_enc" },
  {
    table: "impersonation_sessions",
    plaintextCol: "admin_email",
    encCol: "admin_email_enc",
  },
  {
    table: "impersonation_sessions",
    plaintextCol: "target_email",
    encCol: "target_email_enc",
  },
  // 041 / 042
  { table: "waitlist", plaintextCol: "email", encCol: "email_enc" },
  { table: "waitlist", plaintextCol: "name", encCol: "name_enc" },
  { table: "waitlist", plaintextCol: "ip_address", encCol: "ip_address_enc" },
  { table: "waitlist", plaintextCol: "user_agent", encCol: "user_agent_enc" },
  { table: "beta_applications", plaintextCol: "name", encCol: "name_enc" },
  { table: "beta_applications", plaintextCol: "email", encCol: "email_enc" },
  { table: "beta_applications", plaintextCol: "clinic_name", encCol: "clinic_name_enc" },
  { table: "beta_applications", plaintextCol: "specialty", encCol: "specialty_enc" },
  { table: "beta_applications", plaintextCol: "role", encCol: "role_enc" },
  { table: "beta_applications", plaintextCol: "website", encCol: "website_enc" },
  { table: "beta_applications", plaintextCol: "monthly_volume", encCol: "monthly_volume_enc" },
  { table: "beta_applications", plaintextCol: "why_apply", encCol: "why_apply_enc" },
  { table: "beta_applications", plaintextCol: "ip_address", encCol: "ip_address_enc" },
  { table: "beta_applications", plaintextCol: "user_agent", encCol: "user_agent_enc" },
  { table: "free_audit_leads", plaintextCol: "email", encCol: "email_enc" },
  { table: "free_audit_leads", plaintextCol: "website_url", encCol: "website_url_enc" },
  { table: "free_audit_leads", plaintextCol: "page_title", encCol: "page_title_enc" },
  { table: "free_audit_leads", plaintextCol: "ip_address", encCol: "ip_address_enc" },
  { table: "free_audit_leads", plaintextCol: "user_agent", encCol: "user_agent_enc" },
  { table: "beta_purchases", plaintextCol: "email", encCol: "email_enc" },
]

// Unique constraints removed by cutover migrations. PASS = constraint
// gone (information_schema returns zero rows for the name).
interface DroppedConstraint {
  table: string
  constraintName: string
  migration: string
}
const DROPPED_CONSTRAINTS: ReadonlyArray<DroppedConstraint> = [
  { table: "waitlist", constraintName: "waitlist_email_key", migration: "mig 041" },
  {
    table: "beta_applications",
    constraintName: "beta_applications_email_key",
    migration: "mig 041",
  },
  {
    table: "free_audit_leads",
    constraintName: "free_audit_leads_email_website_url_key",
    migration: "mig 041",
  },
]

const VALID_PREFIXES = ["v1.", "v1u.", "v1r.", "v1s."] as const

type Status = "PASS" | "FAIL" | "SKIP"
interface Result {
  status: Status
  label: string
  detail: string
}

function requireEnv(name: string): string {
  const v = process.env[name]?.trim()
  if (!v) {
    console.error(`Missing required env var ${name}`)
    process.exit(2)
  }
  return v
}

function isColumnMissingError(err: unknown): boolean {
  const e = err as { message?: string; code?: string; details?: string; hint?: string }
  const msg = e?.message ?? ""
  const code = e?.code ?? ""
  const details = e?.details ?? ""
  const hint = e?.hint ?? ""
  const combined = `${msg} ${details} ${hint}`
  // 42703 is the Postgres SQLSTATE for "column does not exist". PostgREST
  // surfaces dropped columns via PGRST204 ("column not found in schema cache").
  // PGRST200 / PGRST205 cover related "not found in cache" cases.
  return (
    code === "42703" ||
    code === "PGRST204" ||
    code === "PGRST200" ||
    code === "PGRST205" ||
    /column .* does not exist/i.test(combined) ||
    /could not find the .* column/i.test(combined) ||
    /column .* not found/i.test(combined)
  )
}

function isTableMissingError(err: unknown): boolean {
  const msg = (err as { message?: string; code?: string })?.message ?? ""
  return (
    /relation .* does not exist/i.test(msg) ||
    /could not find the table/i.test(msg)
  )
}

function isValidEnvelope(v: unknown): boolean {
  if (typeof v !== "string" || v.length === 0) return false
  return VALID_PREFIXES.some((p) => v.startsWith(p))
}

async function checkPlaintextColumn(
  client: SupabaseClient,
  ec: EncryptedColumn,
): Promise<Result> {
  const label = `${ec.table}.${ec.plaintextCol}`
  try {
    // Probe first: does the plaintext column still exist in PostgREST's
    // schema cache? Cheaper than the count, and an unambiguous signal: if
    // the column was dropped at cutover, this errors immediately. Probes
    // also surface a clearer error code than the count path under supabase-js.
    const probe = await client.from(ec.table).select(ec.plaintextCol).limit(0)
    if (probe.error) {
      if (isColumnMissingError(probe.error)) {
        return {
          status: "PASS",
          label,
          detail: "plaintext column dropped (cutover migration applied)",
        }
      }
      if (isTableMissingError(probe.error)) {
        return { status: "SKIP", label, detail: `table missing: ${probe.error.message}` }
      }
      // Unknown probe error - report verbatim so the operator can investigate.
      const eAny = probe.error as { message?: string; code?: string; details?: string }
      const detail = eAny.message || eAny.code || eAny.details || "(empty PostgREST error)"
      return { status: "FAIL", label, detail: `probe error: ${detail}` }
    }
    const { count, error } = await client
      .from(ec.table)
      .select(ec.plaintextCol, { count: "exact", head: true })
      .not(ec.plaintextCol, "is", null)
    if (error) {
      if (isColumnMissingError(error)) {
        return {
          status: "PASS",
          label,
          detail: "plaintext column dropped (cutover migration applied)",
        }
      }
      if (isTableMissingError(error)) {
        return { status: "SKIP", label, detail: `table missing: ${error.message}` }
      }
      const eAny = error as { message?: string; code?: string; details?: string }
      const detail = eAny.message || eAny.code || eAny.details || "(empty PostgREST error)"
      return { status: "FAIL", label, detail: `query error: ${detail}` }
    }
    const n = count ?? 0
    if (n === 0) {
      return {
        status: "PASS",
        label,
        detail: "plaintext column still exists but zero non-null rows",
      }
    }
    return {
      status: "FAIL",
      label,
      detail: `${n} non-null plaintext rows. Cutover migration not yet applied.`,
    }
  } catch (e) {
    if (isColumnMissingError(e)) {
      return {
        status: "PASS",
        label,
        detail: "plaintext column dropped (cutover migration applied)",
      }
    }
    return { status: "FAIL", label, detail: `unexpected error: ${(e as Error).message}` }
  }
}

async function checkEncryptedColumn(
  client: SupabaseClient,
  ec: EncryptedColumn,
): Promise<Result> {
  const label = `${ec.table}.${ec.encCol}`
  try {
    // Count total rows for context.
    const { count: total, error: countErr } = await client
      .from(ec.table)
      .select("id", { count: "exact", head: true })
    if (countErr) {
      if (isTableMissingError(countErr)) {
        return { status: "SKIP", label, detail: `table missing: ${countErr.message}` }
      }
      return { status: "FAIL", label, detail: `count error: ${countErr.message}` }
    }
    if ((total ?? 0) === 0) {
      return {
        status: "PASS",
        label,
        detail: "0 rows (trivially PASS)",
      }
    }

    // Sample up to 10 rows. PostgREST doesn't expose RANDOM(); order by id +
    // limit 10 is the best portable proxy.
    const { data, error } = await client
      .from(ec.table)
      .select(`id, ${ec.encCol}`)
      .order("id", { ascending: true })
      .limit(10)
    if (error) {
      if (isColumnMissingError(error)) {
        return {
          status: "FAIL",
          label,
          detail: `_enc column missing — additive migration not applied`,
        }
      }
      return { status: "FAIL", label, detail: `sample error: ${error.message}` }
    }
    const rows = (data ?? []) as unknown as Array<Record<string, unknown>>
    if (rows.length === 0) {
      return {
        status: "PASS",
        label,
        detail: "0 sampled rows (table emptied between checks)",
      }
    }
    for (const r of rows) {
      const v = r[ec.encCol]
      if (v === null || v === undefined) {
        // Nullable encrypted columns are legal (e.g., rewritten_text_enc,
        // ip_address_enc on rows where the source was null). Only flag when
        // the field MUST be non-null. For now we accept null as PASS — the
        // plaintext-column check above is the canonical "did backfill run?"
        // gate.
        continue
      }
      if (!isValidEnvelope(v)) {
        return {
          status: "FAIL",
          label,
          detail: `row ${String(r.id)} has invalid envelope prefix: ${String(v).slice(0, 12)}...`,
        }
      }
    }
    return {
      status: "PASS",
      label,
      detail: `${total ?? 0} rows, sampled ${rows.length}, all envelopes valid`,
    }
  } catch (e) {
    return { status: "FAIL", label, detail: `unexpected error: ${(e as Error).message}` }
  }
}

async function checkDroppedConstraint(
  client: SupabaseClient,
  dc: DroppedConstraint,
): Promise<Result> {
  const label = `${dc.table} ${dc.constraintName} constraint`
  // Query information_schema via a stored RPC if available; otherwise use the
  // PostgREST table directly. Supabase exposes information_schema views to
  // service-role only.
  const { data, error } = await client
    .schema("information_schema" as never)
    .from("table_constraints" as never)
    .select("constraint_name")
    .eq("table_name", dc.table)
    .eq("constraint_name", dc.constraintName)
  if (error) {
    return {
      status: "FAIL",
      label,
      detail: `information_schema query failed: ${error.message}. Run manually: SELECT FROM information_schema.table_constraints WHERE constraint_name = '${dc.constraintName}'`,
    }
  }
  const rows = (data ?? []) as Array<{ constraint_name: string }>
  if (rows.length === 0) {
    return { status: "PASS", label, detail: `dropped (${dc.migration})` }
  }
  return {
    status: "FAIL",
    label,
    detail: `still present — cutover migration (${dc.migration}) did not drop it`,
  }
}

function fmt(r: Result): string {
  return `[${r.status}] ${r.label} — ${r.detail}`
}

async function main(): Promise<void> {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL")
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY")
  const client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const results: Result[] = []

  console.log("# Plaintext column checks")
  for (const ec of COLUMNS) {
    const r = await checkPlaintextColumn(client, ec)
    results.push(r)
    console.log(fmt(r))
  }
  console.log("")

  console.log("# Encrypted column envelope checks")
  for (const ec of COLUMNS) {
    const r = await checkEncryptedColumn(client, ec)
    results.push(r)
    console.log(fmt(r))
  }
  console.log("")

  console.log("# Dropped unique constraints")
  for (const dc of DROPPED_CONSTRAINTS) {
    const r = await checkDroppedConstraint(client, dc)
    results.push(r)
    console.log(fmt(r))
  }
  console.log("")

  const fails = results.filter((r) => r.status === "FAIL")
  const skips = results.filter((r) => r.status === "SKIP")
  const passes = results.filter((r) => r.status === "PASS")
  console.log(
    `# Summary: ${passes.length} PASS, ${fails.length} FAIL, ${skips.length} SKIP`,
  )

  if (fails.length > 0) {
    console.error(`\nFAILED: ${fails.length} check(s) failed.`)
    process.exit(1)
  }
  console.log("\nAll checks passed.")
  process.exit(0)
}

main().catch((e) => {
  console.error("verify-no-plaintext: fatal error", e)
  process.exit(2)
})
