-- ============================================================
-- Migration 021: search_path guard on SECURITY DEFINER functions
-- ============================================================
-- Every SECURITY DEFINER function must pin search_path to prevent
-- search-path hijack (attacker creates a same-named function/table
-- in a schema they control and puts it earlier in search_path).
--
-- This migration recreates the two unguarded functions from
-- migration 001 with `SET search_path = public, pg_temp`.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
