-- Finalize an authenticated resume report and consume its entitlement in one
-- PostgreSQL transaction. A committed resume-feedback reservation must always
-- point at the complete, trusted report created by the same transition.

ALTER TABLE private.generation_access_reservations
  ADD COLUMN IF NOT EXISTS report_id UUID,
  ADD COLUMN IF NOT EXISTS report_digest VARCHAR(64);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'generation_access_report_digest_shape'
      AND conrelid = 'private.generation_access_reservations'::regclass
  ) THEN
    ALTER TABLE private.generation_access_reservations
      ADD CONSTRAINT generation_access_report_digest_shape
      CHECK (report_digest IS NULL OR report_digest ~ '^[0-9a-f]{64}$');
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS generation_access_report_id_unique_idx
  ON private.generation_access_reservations (report_id)
  WHERE report_id IS NOT NULL;

GRANT SELECT, UPDATE ON TABLE public.saved_jobs TO service_role;

CREATE OR REPLACE FUNCTION public.get_generation_access_status(
  p_user_id UUID,
  p_reservation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_reservation private.generation_access_reservations%ROWTYPE;
  v_report_final BOOLEAN := FALSE;
BEGIN
  SELECT *
  INTO v_reservation
  FROM private.generation_access_reservations
  WHERE id = p_reservation_id
    AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'status', 'missing',
      'action', 'none',
      'report_id', NULL,
      'report_final', FALSE
    );
  END IF;

  IF v_reservation.status = 'committed' AND v_reservation.report_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.reports
      WHERE id = v_reservation.report_id
        AND user_id = p_user_id
    ) INTO v_report_final;
  END IF;

  RETURN jsonb_build_object(
    'ok', TRUE,
    'status', v_reservation.status,
    'action', 'none',
    'report_id', v_reservation.report_id,
    'report_final', v_report_final,
    'report_digest', v_reservation.report_digest
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.finalize_generation_report(
  p_user_id UUID,
  p_reservation_id UUID,
  p_report_digest TEXT,
  p_resume_hash TEXT,
  p_score INTEGER,
  p_score_label TEXT,
  p_report_json JSONB,
  p_evidence_json JSONB,
  p_evidence_version TEXT,
  p_evidence_summary TEXT,
  p_confidence_band TEXT,
  p_resume_preview TEXT,
  p_job_description_text TEXT,
  p_target_role TEXT,
  p_saved_job_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
  v_reservation private.generation_access_reservations%ROWTYPE;
  v_report_id UUID := gen_random_uuid();
  v_remaining_uses INTEGER;
BEGIN
  IF p_user_id IS NULL
    OR p_reservation_id IS NULL
    OR p_report_digest IS NULL
    OR p_report_digest !~ '^[0-9a-f]{64}$'
    OR p_resume_hash IS NULL
    OR p_resume_hash !~ '^[0-9a-f]{64}$'
    OR p_report_json IS NULL
    OR p_evidence_json IS NULL
    OR NULLIF(p_evidence_version, '') IS NULL
    OR p_score IS NULL
    OR p_score < 0
    OR p_score > 100
    OR p_confidence_band NOT IN ('low', 'medium', 'high')
      AND p_confidence_band IS NOT NULL
    OR length(COALESCE(p_resume_preview, '')) > 200
  THEN
    RAISE EXCEPTION 'invalid generation report finalization';
  END IF;

  INSERT INTO public.user_usage (user_id, created_at, updated_at)
  VALUES (p_user_id, v_now, v_now)
  ON CONFLICT (user_id) DO NOTHING;

  PERFORM 1
  FROM public.user_usage
  WHERE user_id = p_user_id
  FOR UPDATE;

  SELECT *
  INTO v_reservation
  FROM private.generation_access_reservations
  WHERE id = p_reservation_id
    AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', FALSE, 'status', 'missing', 'action', 'none');
  END IF;

  IF v_reservation.report_kind <> 'resume_feedback' THEN
    RAISE EXCEPTION 'reservation is not a resume report';
  END IF;

  IF v_reservation.status = 'committed' THEN
    IF v_reservation.report_id IS NULL OR v_reservation.report_digest IS NULL THEN
      RAISE EXCEPTION 'committed report finalization invariant failed';
    END IF;
    IF v_reservation.report_digest <> p_report_digest THEN
      RAISE EXCEPTION 'finalization payload mismatch';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM public.reports
      WHERE id = v_reservation.report_id AND user_id = p_user_id
    ) THEN
      RAISE EXCEPTION 'committed report is unavailable';
    END IF;
    RETURN jsonb_build_object(
      'ok', TRUE,
      'status', 'committed',
      'action', 'none',
      'report_id', v_reservation.report_id,
      'report_final', TRUE,
      'idempotent', TRUE
    );
  END IF;

  IF v_reservation.status <> 'reserved' THEN
    RETURN jsonb_build_object(
      'ok', FALSE,
      'status', v_reservation.status,
      'action', 'none',
      'report_final', FALSE
    );
  END IF;

  IF v_reservation.expires_at <= v_now THEN
    UPDATE private.generation_access_reservations
    SET status = 'expired', reason_code = 'reservation_expired',
      released_at = v_now, updated_at = v_now
    WHERE id = p_reservation_id AND status = 'reserved';
    RETURN jsonb_build_object('ok', FALSE, 'status', 'expired', 'action', 'released');
  END IF;

  IF p_saved_job_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.saved_jobs
    WHERE id = p_saved_job_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'saved job ownership mismatch';
  END IF;

  IF v_reservation.entitlement_kind = 'free' THEN
    UPDATE public.user_usage
    SET free_report_used_at = v_now, updated_at = v_now
    WHERE user_id = p_user_id AND free_report_used_at IS NULL;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'free report commit conflict';
    END IF;
  ELSIF v_reservation.entitlement_kind = 'pass_credit' THEN
    UPDATE public.passes
    SET uses_remaining = uses_remaining - 1, updated_at = v_now
    WHERE id = v_reservation.pass_id
      AND user_id = p_user_id
      AND uses_remaining > 0
    RETURNING uses_remaining INTO v_remaining_uses;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'pass credit commit conflict';
    END IF;
  ELSIF v_reservation.entitlement_kind <> 'pass_unlimited' THEN
    RAISE EXCEPTION 'unsupported generation entitlement';
  END IF;

  INSERT INTO public.reports (
    id, user_id, resume_hash, score, score_label, report_json,
    evidence_json, evidence_version, evidence_summary, confidence_band,
    saved_job_id, resume_preview, job_description_text, target_role,
    created_at, updated_at
  ) VALUES (
    v_report_id, p_user_id, p_resume_hash, p_score, p_score_label, p_report_json,
    p_evidence_json, p_evidence_version, p_evidence_summary, p_confidence_band,
    p_saved_job_id, p_resume_preview, p_job_description_text, p_target_role,
    v_now, v_now
  );

  IF p_saved_job_id IS NOT NULL THEN
    UPDATE public.saved_jobs
    SET latest_report_id = v_report_id, updated_at = v_now
    WHERE id = p_saved_job_id AND user_id = p_user_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'saved job update failed';
    END IF;
  END IF;

  UPDATE private.generation_access_reservations
  SET status = 'committed', committed_at = v_now, updated_at = v_now,
    report_id = v_report_id, report_digest = p_report_digest
  WHERE id = p_reservation_id AND user_id = p_user_id AND status = 'reserved';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'generation finalization lost its reservation';
  END IF;

  RETURN jsonb_build_object(
    'ok', TRUE,
    'status', 'committed',
    'action', 'committed',
    'report_id', v_report_id,
    'report_final', TRUE,
    'idempotent', FALSE,
    'remaining_uses', v_remaining_uses
  );
END;
$$;

CREATE OR REPLACE FUNCTION private.require_atomic_resume_report_commit()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF OLD.status = 'reserved'
    AND NEW.status = 'committed'
    AND NEW.report_kind = 'resume_feedback'
    AND (NEW.report_id IS NULL OR NEW.report_digest IS NULL)
  THEN
    RAISE EXCEPTION 'resume report access must use atomic finalization';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS require_atomic_resume_report_commit
  ON private.generation_access_reservations;
CREATE TRIGGER require_atomic_resume_report_commit
  BEFORE UPDATE ON private.generation_access_reservations
  FOR EACH ROW
  EXECUTE FUNCTION private.require_atomic_resume_report_commit();

REVOKE ALL ON FUNCTION public.get_generation_access_status(UUID, UUID)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.finalize_generation_report(
  UUID, UUID, TEXT, TEXT, INTEGER, TEXT, JSONB, JSONB, TEXT, TEXT,
  TEXT, TEXT, TEXT, TEXT, UUID
) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.require_atomic_resume_report_commit()
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.get_generation_access_status(UUID, UUID)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.finalize_generation_report(
  UUID, UUID, TEXT, TEXT, INTEGER, TEXT, JSONB, JSONB, TEXT, TEXT,
  TEXT, TEXT, TEXT, TEXT, UUID
) TO service_role;

COMMENT ON FUNCTION public.finalize_generation_report(
  UUID, UUID, TEXT, TEXT, INTEGER, TEXT, JSONB, JSONB, TEXT, TEXT,
  TEXT, TEXT, TEXT, TEXT, UUID
) IS 'Atomically consumes authenticated report access and inserts its complete trusted report.';
