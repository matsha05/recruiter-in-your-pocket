-- Persist anonymous receipt consumption outside user-mutable report rows.
-- The private ledger retains no user identity, expires with the signed bearer,
-- and survives report/account deletion only for that bounded replay window.
-- The invoker-rights RPC claims a receipt and inserts its report atomically.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA private TO service_role;

CREATE TABLE IF NOT EXISTS private.anonymous_report_receipt_claims (
  receipt_hash VARCHAR(64) PRIMARY KEY,
  report_id UUID NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  expires_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT anonymous_report_receipt_hash_check
    CHECK (receipt_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT anonymous_report_receipt_expiry_check
    CHECK (expires_at > claimed_at AND expires_at <= claimed_at + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS anonymous_report_receipt_claims_expiry_idx
  ON private.anonymous_report_receipt_claims (expires_at);

ALTER TABLE private.anonymous_report_receipt_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.anonymous_report_receipt_claims FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.anonymous_report_receipt_claims FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT ON TABLE private.anonymous_report_receipt_claims TO service_role;

-- Reports are displayed/deleted by their owner, but browser roles must not
-- directly insert signed trust metadata or mutate report content after signing.
REVOKE INSERT, UPDATE ON TABLE public.reports FROM anon, authenticated;
GRANT SELECT, DELETE ON TABLE public.reports TO authenticated;
GRANT UPDATE (name, resume_variant) ON TABLE public.reports TO authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.reports TO service_role;

CREATE OR REPLACE FUNCTION public.claim_anonymous_report_receipt(
  p_receipt_hash TEXT,
  p_expires_at TIMESTAMPTZ,
  p_user_id UUID,
  p_report_id UUID,
  p_resume_hash TEXT,
  p_score INTEGER,
  p_score_label TEXT,
  p_report_json JSONB,
  p_evidence_json JSONB,
  p_evidence_version TEXT,
  p_resume_preview TEXT,
  p_target_role TEXT,
  p_created_at TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
  v_claim private.anonymous_report_receipt_claims%ROWTYPE;
BEGIN
  IF p_receipt_hash !~ '^[0-9a-f]{64}$'
    OR p_expires_at IS NULL
    OR p_expires_at <= v_now
    OR p_expires_at > v_now + INTERVAL '24 hours'
    OR p_user_id IS NULL
    OR p_report_id IS NULL
    OR p_report_json IS NULL
    OR p_evidence_json IS NULL
    OR p_evidence_version IS NULL
  THEN
    RAISE EXCEPTION 'invalid anonymous report receipt claim';
  END IF;

  INSERT INTO private.anonymous_report_receipt_claims (
    receipt_hash, report_id, claimed_at, expires_at
  ) VALUES (
    p_receipt_hash, p_report_id, v_now, p_expires_at
  )
  ON CONFLICT (receipt_hash) DO NOTHING
  RETURNING * INTO v_claim;

  IF FOUND THEN
    INSERT INTO public.reports (
      id, user_id, resume_hash, score, score_label, report_json,
      evidence_json, evidence_version, resume_preview, target_role, created_at
    ) VALUES (
      p_report_id, p_user_id, p_resume_hash, p_score, p_score_label, p_report_json,
      p_evidence_json, p_evidence_version, p_resume_preview, p_target_role,
      COALESCE(p_created_at, clock_timestamp())
    );
    RETURN jsonb_build_object('status', 'created', 'report_id', p_report_id);
  END IF;

  SELECT * INTO v_claim
  FROM private.anonymous_report_receipt_claims
  WHERE receipt_hash = p_receipt_hash;

  IF EXISTS (
    SELECT 1 FROM public.reports
    WHERE id = v_claim.report_id AND user_id = p_user_id
  ) THEN
    RETURN jsonb_build_object('status', 'idempotent', 'report_id', v_claim.report_id);
  END IF;

  RETURN jsonb_build_object('status', 'consumed');
END;
$$;

REVOKE ALL ON FUNCTION public.claim_anonymous_report_receipt(
  TEXT, TIMESTAMPTZ, UUID, UUID, TEXT, INTEGER, TEXT, JSONB, JSONB, TEXT, TEXT, TEXT, TIMESTAMPTZ
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_anonymous_report_receipt(
  TEXT, TIMESTAMPTZ, UUID, UUID, TEXT, INTEGER, TEXT, JSONB, JSONB, TEXT, TEXT, TEXT, TIMESTAMPTZ
) TO service_role;

CREATE OR REPLACE FUNCTION private.purge_expired_anonymous_report_receipt_claims()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM private.anonymous_report_receipt_claims
  WHERE expires_at <= clock_timestamp();
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION private.purge_expired_anonymous_report_receipt_claims()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.purge_expired_anonymous_report_receipt_claims()
  TO service_role;

SELECT cron.schedule(
  'riyp-purge-expired-anonymous-report-receipts',
  '29 * * * *',
  'SELECT private.purge_expired_anonymous_report_receipt_claims();'
);

COMMENT ON TABLE private.anonymous_report_receipt_claims IS
  'Short-lived receipt digest claims. No bearer receipt, user identity, or report content is stored.';
