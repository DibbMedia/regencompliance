import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"
import { join } from "path"

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations")

function readMigration(name: string): string {
  return readFileSync(join(MIGRATIONS_DIR, name), "utf8")
}

// ============================================================
// Migration 020: profiles field guard
// ============================================================
// These tests mirror docs/adversarial-probes.md Probe 1. A real
// runtime probe would need a logged-in user session; here we
// assert the migration shape so accidental edits that remove a
// protected field, loosen the role check, or drop the trigger
// fail CI instead of shipping silently.
describe("migration 020 - profiles_field_guard", () => {
  const sql = readMigration("020_privilege_escalation_profiles.sql")

  it("defines enforce_profile_field_guard function", () => {
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION enforce_profile_field_guard/)
  })

  it("attaches BEFORE UPDATE trigger named profiles_field_guard", () => {
    expect(sql).toMatch(/CREATE TRIGGER profiles_field_guard[\s\S]*BEFORE UPDATE ON profiles/)
  })

  it("exempts service_role and postgres", () => {
    expect(sql).toMatch(/caller_role = 'service_role'[\s\S]{0,40}caller_role = 'postgres'/)
  })

  it("exempts platform_admins by JWT email", () => {
    expect(sql).toMatch(/FROM platform_admins/)
    expect(sql).toMatch(/auth\.jwt\(\) ->> 'email'/)
  })

  const PROTECTED_FIELDS = [
    "subscription_status",
    "stripe_customer_id",
    "stripe_subscription_id",
    "is_beta_subscriber",
    "beta_enrolled_at",
    "badge_id",
  ]

  PROTECTED_FIELDS.forEach((field) => {
    it(`blocks user writes to ${field}`, () => {
      const pattern = new RegExp(
        `NEW\\.${field}\\s+IS\\s+DISTINCT\\s+FROM\\s+OLD\\.${field}`,
        "i",
      )
      expect(sql).toMatch(pattern)
    })
  })

  it("raises exception with canonical error string", () => {
    expect(sql).toMatch(/RAISE EXCEPTION[\s\S]*Protected profile field/)
  })

  it("function runs with SECURITY DEFINER and pinned search_path", () => {
    expect(sql).toMatch(/SECURITY DEFINER/)
    expect(sql).toMatch(/SET search_path = public/)
  })
})

// ============================================================
// Migration 022: logos bucket storage RLS
// ============================================================
// Mirrors Probe 2 from docs/adversarial-probes.md. Regression
// guard against a merge that drops the owner check or flips the
// bucket to service-role-only.
describe("migration 022 - logos bucket RLS", () => {
  const sql = readMigration("022_storage_logos_rls.sql")

  it("ensures logos bucket exists and is public", () => {
    expect(sql).toMatch(/INSERT INTO storage\.buckets[\s\S]*'logos'[\s\S]*public/)
    expect(sql).toMatch(/ON CONFLICT \(id\) DO UPDATE SET public = true/)
  })

  it("public SELECT policy allows anyone to read logos", () => {
    expect(sql).toMatch(
      /CREATE POLICY "logos public read"[\s\S]*FOR SELECT[\s\S]*bucket_id = 'logos'/,
    )
  })

  const OWNER_OPERATIONS = ["INSERT", "UPDATE", "DELETE"] as const

  OWNER_OPERATIONS.forEach((op) => {
    it(`${op} policy restricts writes to the owner's folder`, () => {
      const policyPattern = new RegExp(
        `CREATE POLICY "logos owner ${op.toLowerCase()}"[\\s\\S]*?FOR ${op}[\\s\\S]*?` +
          `bucket_id = 'logos'[\\s\\S]*?` +
          `storage\\.foldername\\(name\\)\\)\\[1\\] = auth\\.uid\\(\\)::text`,
      )
      expect(sql).toMatch(policyPattern)
    })

    it(`${op} policy is limited to authenticated users`, () => {
      const tokenPattern = new RegExp(
        `CREATE POLICY "logos owner ${op.toLowerCase()}"[\\s\\S]*?TO authenticated`,
      )
      expect(sql).toMatch(tokenPattern)
    })
  })
})

// ============================================================
// Migration 023: newsletter_subscribers
// ============================================================
// New table shipped this session. Lock the shape so refactors
// can't silently expose it to anon/authenticated roles.
describe("migration 023 - newsletter_subscribers", () => {
  const sql = readMigration("023_newsletter_subscribers.sql")

  it("creates newsletter_subscribers table", () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS newsletter_subscribers/)
  })

  it("enforces unique email", () => {
    expect(sql).toMatch(/email\s+text\s+NOT\s+NULL\s+UNIQUE/i)
  })

  it("enables row level security", () => {
    expect(sql).toMatch(/ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY/)
  })

  it("locks all direct access behind service role", () => {
    expect(sql).toMatch(/CREATE POLICY "Service role only"[\s\S]*FOR ALL[\s\S]*USING \(false\)/)
  })
})
