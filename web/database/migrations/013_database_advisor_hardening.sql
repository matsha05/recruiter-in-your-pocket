-- Clear actionable Supabase security and RLS performance advisor findings.
-- Keep this migration after generation-access reservations so its advisor pass
-- validates the complete launch schema.

-- Extension objects should not live in the API-exposed public schema.
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
ALTER EXTENSION vector SET SCHEMA extensions;

-- Trigger functions do not need a caller-controlled search path or direct API
-- execution. pg_catalog is sufficient for NOW() and other built-ins.
ALTER FUNCTION public.update_updated_at_column() SET search_path TO pg_catalog;
ALTER FUNCTION public.touch_updated_at() SET search_path TO pg_catalog;

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- Some older Supabase projects contain this advisor helper, while a clean
-- repository replay does not create it. Harden it only when present.
DO $$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated';
  END IF;
END $$;

-- Make the webhook table's default-deny intent explicit. The service role
-- bypasses RLS; browser roles receive no rows and cannot write.
DROP POLICY IF EXISTS stripe_events_no_client_access ON public.stripe_events;
CREATE POLICY stripe_events_no_client_access ON public.stripe_events
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Replace older per-row auth.uid() policies with init-plan-friendly checks and
-- scope them to signed-in users. Service-role access continues to bypass RLS.

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;
CREATE POLICY "Users can delete own profile" ON public.user_profiles
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own cases" ON public.cases;
CREATE POLICY "Users can view their own cases" ON public.cases
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own cases" ON public.cases;
CREATE POLICY "Users can insert their own cases" ON public.cases
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own cases" ON public.cases;
CREATE POLICY "Users can update their own cases" ON public.cases
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own cases" ON public.cases;
CREATE POLICY "Users can delete their own cases" ON public.cases
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view artifacts of their cases" ON public.artifacts;
CREATE POLICY "Users can view artifacts of their cases" ON public.artifacts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.cases AS owned_case
      WHERE owned_case.id = artifacts.case_id
        AND owned_case.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert artifacts to their cases" ON public.artifacts;
CREATE POLICY "Users can insert artifacts to their cases" ON public.artifacts
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.cases AS owned_case
      WHERE owned_case.id = artifacts.case_id
        AND owned_case.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update artifacts of their cases" ON public.artifacts;
CREATE POLICY "Users can update artifacts of their cases" ON public.artifacts
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.cases AS owned_case
      WHERE owned_case.id = artifacts.case_id
        AND owned_case.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.cases AS owned_case
      WHERE owned_case.id = artifacts.case_id
        AND owned_case.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete artifacts of their cases" ON public.artifacts;
CREATE POLICY "Users can delete artifacts of their cases" ON public.artifacts
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.cases AS owned_case
      WHERE owned_case.id = artifacts.case_id
        AND owned_case.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS reports_owner_select ON public.reports;
CREATE POLICY reports_owner_select ON public.reports
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS reports_owner_insert ON public.reports;
CREATE POLICY reports_owner_insert ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS reports_owner_delete ON public.reports;
CREATE POLICY reports_owner_delete ON public.reports
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS saved_jobs_owner_select ON public.saved_jobs;
CREATE POLICY saved_jobs_owner_select ON public.saved_jobs
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS saved_jobs_owner_insert ON public.saved_jobs;
CREATE POLICY saved_jobs_owner_insert ON public.saved_jobs
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS saved_jobs_owner_delete ON public.saved_jobs;
CREATE POLICY saved_jobs_owner_delete ON public.saved_jobs
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);
