-- Critical Miss feedback is kept for 12 months to check report quality, then
-- deleted (privacy policy, Nov 1, 2026). Same pattern as the account-export
-- expiry in 015: a pg_cron job calls a service-role-only function daily.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

CREATE OR REPLACE FUNCTION private.expire_report_feedback()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  DELETE FROM public.report_feedback
  WHERE created_at < NOW() - INTERVAL '12 months';

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$;

REVOKE ALL ON FUNCTION private.expire_report_feedback() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.expire_report_feedback() TO service_role;

SELECT cron.schedule(
  'riyp-expire-report-feedback',
  '41 3 * * *',
  'SELECT private.expire_report_feedback();'
);
