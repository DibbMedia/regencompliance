-- Add last_error column to site_pages so per-page failure reasons are
-- visible in the dashboard and DB without grepping Vercel runtime logs.
ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS last_error text;
