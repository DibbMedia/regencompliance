-- ============================================================
-- PENDING PROD MIGRATIONS - 2026-05-07
-- ============================================================
-- Run this in Supabase Dashboard -> SQL Editor against PROD.
-- Contains migrations 031 + 032 from supabase/migrations/.
--
-- Both are idempotent (CREATE INDEX IF NOT EXISTS, INSERT ... ON
-- CONFLICT, UPDATE ... WHERE) so re-running is safe.
--
-- After running, the matching .sql files in supabase/migrations/
-- should NOT be re-applied; they're tracked-as-source-of-truth only.
-- ============================================================


-- ─── 031: Storage MIME and size constraints for `logos` ────
-- Migration 022 set up path-scoped RLS for the `logos` bucket but
-- did NOT cap MIME or size. Without these, an authenticated user
-- can upload arbitrary files via the Supabase JS SDK, bypassing
-- the client-side image/* + 2MB validation in the onboarding form.
-- The bucket is publicly readable, so it could become a free public
-- file host on compliance.regenportal.com.
-- ============================================================

UPDATE storage.buckets
SET
  file_size_limit = 2 * 1024 * 1024,            -- 2 MB
  allowed_mime_types = ARRAY[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
  ]
WHERE id = 'logos';

-- Defensive: ensure the bucket still exists (idempotent w/ migration 022).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos',
  true,
  2 * 1024 * 1024,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;


-- ─── 032: Free-audit lead dedup constraint ─────────────────
-- Pairs with the per-email daily cap added in
-- app/api/free-audit/route.ts. Even if the rate limits permit
-- another insert (user retries 24h+1min later, or Redis cache
-- evicts), the unique index prevents same-day duplicates.
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS uniq_free_audit_email_url_day
  ON free_audit_leads (
    lower(email),
    lower(website_url),
    (date_trunc('day', created_at))
  );

-- Backfill any older rows so the new index doesn't false-fire on
-- case-mismatched dupes. The route now writes lower-cased email.
UPDATE free_audit_leads
SET email = lower(email)
WHERE email <> lower(email);


-- ============================================================
-- Done. Verify with:
--   SELECT id, file_size_limit, allowed_mime_types FROM storage.buckets WHERE id = 'logos';
--   SELECT indexname FROM pg_indexes WHERE tablename = 'free_audit_leads' AND indexname = 'uniq_free_audit_email_url_day';
-- ============================================================
