-- Keep privacy export payloads bounded even when the application worker is
-- unavailable and the user never returns to trigger request-time cleanup.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

CREATE OR REPLACE FUNCTION private.expire_account_export_results()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE public.account_export_jobs
  SET
    status = 'expired',
    result_json = NULL,
    file_path = NULL,
    file_url = NULL,
    updated_at = NOW()
  WHERE status <> 'expired'
    AND (
      expires_at <= NOW()
      OR (status = 'completed' AND expires_at IS NULL)
    );

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$;

REVOKE ALL ON FUNCTION private.expire_account_export_results() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.expire_account_export_results() TO service_role;

SELECT cron.schedule(
  'riyp-expire-account-exports',
  '17 * * * *',
  'SELECT private.expire_account_export_results();'
);
