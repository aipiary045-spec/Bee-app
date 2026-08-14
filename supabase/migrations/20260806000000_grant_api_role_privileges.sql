-- Grant table/sequence/function privileges to the Supabase API roles.
--
-- The initial migrations enable Row Level Security and define per-user policies,
-- but they rely on implicit default privileges for the PostgREST API roles.
-- On a clean Supabase database (for example `supabase start` locally, or a fresh
-- project), the `anon` and `authenticated` roles are NOT granted DML on public
-- tables by default, so every request fails with
-- "permission denied for table ...". These grants make the tables reachable by
-- the API roles; per-row access is still fully enforced by the existing RLS
-- policies. Safe to re-run.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Existing objects.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public
  TO authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public
  TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public
  TO anon, authenticated, service_role;

-- Objects created later inherit the same grants.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;
