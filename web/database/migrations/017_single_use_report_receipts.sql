-- Persist anonymous receipt consumption outside user-mutable report rows.
-- The private ledger is append-only for service_role, has no report/user FK,
-- and therefore survives report or account deletion. The invoker-rights RPC
-- claims a receipt and inserts its report in one transaction.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA private TO service_role;

CREATE TABLE IF NOT EXISTS private.anonymous_report_receipt_claims (
  receipt_hash VARCHAR(64) PRIMARY KEY,
  user_id UUID NOT NULL,
  report_id UUID NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT anonymous_report_receipt_hash_check
    CHECK (receipt_hash ~ '^[0-9a-f]{64}$')
);

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
  v_claim private.anonymous_report_receipt_claims%ROWTYPE;
BEGIN
  IF p_receipt_hash !~ '^[0-9a-f]{64}$'
    OR p_user_id IS NULL
    OR p_report_id IS NULL
    OR p_report_json IS NULL
    OR p_evidence_json IS NULL
    OR p_evidence_version IS NULL
  THEN
    RAISE EXCEPTION 'invalid anonymous report receipt claim';
  END IF;

  INSERT INTO private.anonymous_report_receipt_claims (
    receipt_hash, user_id, report_id, claimed_at
  ) VALUES (
    p_receipt_hash, p_user_id, p_report_id, COALESCE(p_created_at, clock_timestamp())
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

  IF v_claim.user_id = p_user_id AND EXISTS (
    SELECT 1 FROM public.reports
    WHERE id = v_claim.report_id AND user_id = p_user_id
  ) THEN
    RETURN jsonb_build_object('status', 'idempotent', 'report_id', v_claim.report_id);
  END IF;

  RETURN jsonb_build_object('status', 'consumed');
END;
$$;

REVOKE ALL ON FUNCTION public.claim_anonymous_report_receipt(
  TEXT, UUID, UUID, TEXT, INTEGER, TEXT, JSONB, JSONB, TEXT, TEXT, TEXT, TIMESTAMPTZ
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_anonymous_report_receipt(
  TEXT, UUID, UUID, TEXT, INTEGER, TEXT, JSONB, JSONB, TEXT, TEXT, TEXT, TIMESTAMPTZ
) TO service_role;

COMMENT ON TABLE private.anonymous_report_receipt_claims IS
  'Append-only receipt digest claims. No bearer receipt or report content is stored.';
