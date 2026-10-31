-- ==============================================================================
-- MICRO MOTORS / METRO MOTORS — SUPABASE FREE PROJECT KEEPALIVE MIGRATION
-- Migration: 001_create_project_keepalive.sql
-- Purpose: Creates a minimal, safe, read-only health-check table to maintain
--          periodic database query activity via Supabase REST API (PostgREST).
-- Safety:
--   - Completely isolated from existing business logic and tables.
--   - Idempotent: Can be run multiple times safely without error or duplicates.
--   - RLS Enabled: Anonymous role (anon) is granted ONLY SELECT on row id = 1.
--   - No INSERT, UPDATE, DELETE permissions granted to anon.
--   - No customer or administrator data is touched or exposed.
-- ==============================================================================

-- 1. Create the keepalive health-check table if it doesn't already exist
CREATE TABLE IF NOT EXISTS public.project_keepalive (
    id INTEGER PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'active'
);

-- 2. Insert exactly one baseline health-check record (id = 1)
--    If it already exists, do nothing (idempotent).
INSERT INTO public.project_keepalive (id, status)
VALUES (1, 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. Enable Row Level Security (RLS) to enforce strict access control
ALTER TABLE public.project_keepalive
ENABLE ROW LEVEL SECURITY;

-- 4. Grant schema USAGE and table SELECT permission to the 'anon' role
--    (The anon role is used by the Supabase publishable/anon API key)
GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT
ON TABLE public.project_keepalive
TO anon;

-- 5. Revoke any unintended write privileges from anon as defensive hardening
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES
ON TABLE public.project_keepalive
FROM anon;

-- 6. Define an idempotent Row Level Security (RLS) policy
--    Restricts anonymous SELECT access strictly to row id = 1.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'project_keepalive'
          AND policyname = 'keepalive_read_only'
    ) THEN
        CREATE POLICY keepalive_read_only
        ON public.project_keepalive
        FOR SELECT
        TO anon
        USING (id = 1);
    END IF;
END $$;

