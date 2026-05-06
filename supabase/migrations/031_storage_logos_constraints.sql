-- ============================================================
-- Migration 031: Storage MIME and size constraints for `logos`
-- ============================================================
-- Migration 022 set up path-scoped RLS for the `logos` bucket
-- but did NOT cap the MIME type or file size. The client at
-- app/onboarding/clinic/page.tsx enforces image/* + 2MB, but a
-- direct Supabase JS upload from an authenticated session can
-- bypass that check entirely. Without these constraints the
-- bucket becomes a free public file host for any signed-in
-- user (CDN abuse, malware staging, phishing kits).
--
-- These limits are enforced at the storage gateway, before the
-- object even reaches RLS. See:
-- https://supabase.com/docs/guides/storage/uploads/standard-uploads#mime-type-and-file-size-limits
--
-- 2 MB matches the existing client cap. Allowed MIME list mirrors
-- the file <input accept> attribute on the onboarding form.

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
