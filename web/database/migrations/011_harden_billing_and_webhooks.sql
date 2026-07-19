-- Keep billing entitlements and server-managed workflow state writable only by
-- trusted backend clients. Authenticated users may still read their own rows.

ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_export_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS passes_owner_select ON public.passes;
DROP POLICY IF EXISTS passes_owner_insert ON public.passes;
DROP POLICY IF EXISTS passes_owner_update ON public.passes;
DROP POLICY IF EXISTS passes_owner_delete ON public.passes;
CREATE POLICY passes_owner_select ON public.passes
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS user_usage_owner_select ON public.user_usage;
DROP POLICY IF EXISTS user_usage_owner_insert ON public.user_usage;
DROP POLICY IF EXISTS user_usage_owner_update ON public.user_usage;
DROP POLICY IF EXISTS user_usage_owner_delete ON public.user_usage;
CREATE POLICY user_usage_owner_select ON public.user_usage
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS billing_receipts_owner_select ON public.billing_receipts;
DROP POLICY IF EXISTS billing_receipts_owner_insert ON public.billing_receipts;
DROP POLICY IF EXISTS billing_receipts_owner_update ON public.billing_receipts;
DROP POLICY IF EXISTS billing_receipts_owner_delete ON public.billing_receipts;
CREATE POLICY billing_receipts_owner_select ON public.billing_receipts
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS account_export_jobs_owner_select ON public.account_export_jobs;
DROP POLICY IF EXISTS account_export_jobs_owner_insert ON public.account_export_jobs;
DROP POLICY IF EXISTS account_export_jobs_owner_update ON public.account_export_jobs;
DROP POLICY IF EXISTS account_export_jobs_owner_delete ON public.account_export_jobs;
CREATE POLICY account_export_jobs_owner_select ON public.account_export_jobs
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

REVOKE INSERT, UPDATE, DELETE ON public.passes FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.user_usage FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.billing_receipts FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.account_export_jobs FROM anon, authenticated;

-- Make owner updates explicit about both the existing and resulting owner.
DROP POLICY IF EXISTS reports_owner_update ON public.reports;
CREATE POLICY reports_owner_update ON public.reports
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS saved_jobs_owner_update ON public.saved_jobs;
CREATE POLICY saved_jobs_owner_update ON public.saved_jobs
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Track webhook attempts through fulfillment instead of treating receipt as
-- completion. Existing audit rows predate this state machine and are complete.
ALTER TABLE public.stripe_events ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.stripe_events ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.stripe_events ADD COLUMN IF NOT EXISTS last_error TEXT;
ALTER TABLE public.stripe_events ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.stripe_events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE public.stripe_events
SET
  status = COALESCE(status, 'completed'),
  completed_at = COALESCE(completed_at, processed_at, created_at),
  updated_at = COALESCE(updated_at, processed_at, created_at, NOW())
WHERE status IS NULL OR completed_at IS NULL;

ALTER TABLE public.stripe_events ALTER COLUMN status SET DEFAULT 'processing';
ALTER TABLE public.stripe_events ALTER COLUMN status SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'stripe_events_status_check'
      AND conrelid = 'public.stripe_events'::regclass
  ) THEN
    ALTER TABLE public.stripe_events
      ADD CONSTRAINT stripe_events_status_check
      CHECK (status IN ('processing', 'completed', 'failed'));
  END IF;
END $$;

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.stripe_events FROM anon, authenticated;
