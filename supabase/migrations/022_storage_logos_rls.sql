-- ============================================================
-- Migration 022: Storage RLS for `logos` bucket
-- ============================================================
-- The `logos` bucket stores clinic logos displayed on public
-- scan/badge pages, so READ is intentionally public. Writes,
-- however, must be scoped to the owning profile — the first
-- path segment of the object name must equal the uploader's
-- auth.uid(). Prevents a user from overwriting another clinic's
-- logo or uploading arbitrary files.
--
-- NOTE: This migration assumes the `logos` bucket already exists
-- (it was created from the dashboard). If it does not, the INSERT
-- into storage.buckets below is a no-op on conflict.

INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "logos public read" ON storage.objects;
CREATE POLICY "logos public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

DROP POLICY IF EXISTS "logos owner insert" ON storage.objects;
CREATE POLICY "logos owner insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "logos owner update" ON storage.objects;
CREATE POLICY "logos owner update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "logos owner delete" ON storage.objects;
CREATE POLICY "logos owner delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
