-- Atomic access holds for paid model generation.
--
-- Authenticated free/pass decisions are serialized by the user's canonical
-- user_usage row. A hold consumes capacity but does not mutate the entitlement
-- until validated model output is ready to commit. Cleanup is state-aware and
-- idempotent, including a single refund after a committed delivery failure.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA private TO service_role;

CREATE TABLE IF NOT EXISTS private.generation_access_reservations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_kind TEXT NOT NULL,
  entitlement_kind TEXT NOT NULL,
  access_tier TEXT NOT NULL,
  pass_id UUID REFERENCES public.passes(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'reserved',
  reason_code TEXT,
  reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  committed_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT generation_access_report_kind_check
    CHECK (report_kind IN ('resume_feedback', 'resume_ideas')),
  CONSTRAINT generation_access_entitlement_kind_check
    CHECK (entitlement_kind IN ('free', 'pass_credit', 'pass_unlimited')),
  CONSTRAINT generation_access_access_tier_check
    CHECK (access_tier IN ('free_full', 'pass_full')),
  CONSTRAINT generation_access_status_check
    CHECK (status IN ('reserved', 'committed', 'released', 'refunded', 'expired')),
  CONSTRAINT generation_access_pass_shape_check
    CHECK (
      (entitlement_kind = 'free' AND pass_id IS NULL)
      OR (entitlement_kind IN ('pass_credit', 'pass_unlimited') AND pass_id IS NOT NULL)
    ),
  CONSTRAINT generation_access_expiry_check
    CHECK (expires_at > reserved_at),
  CONSTRAINT generation_access_reason_check
    CHECK (
      reason_code IS NULL OR reason_code IN (
        'provider_error',
        'provider_timeout',
        'validation_error',
        'client_disconnect',
        'delivery_error',
        'internal_error',
        'reservation_expired',
        'commit_conflict',
        'refund_conflict'
      )
    )
);

CREATE INDEX IF NOT EXISTS generation_access_user_status_idx
  ON private.generation_access_reservations (user_id, status, expires_at);

CREATE INDEX IF NOT EXISTS generation_access_pass_status_idx
  ON private.generation_access_reservations (pass_id, status, expires_at)
  WHERE pass_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS generation_access_one_free_hold_per_user_idx
  ON private.generation_access_reservations (user_id)
  WHERE status = 'reserved' AND entitlement_kind = 'free';

ALTER TABLE private.generation_access_reservations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.generation_access_reservations FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE private.generation_access_reservations TO service_role;

-- Defense in depth: no direct writer or future bug may create a negative pass.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'passes_uses_remaining_nonnegative'
      AND conrelid = 'public.passes'::regclass
  ) THEN
    ALTER TABLE public.passes
      ADD CONSTRAINT passes_uses_remaining_nonnegative
      CHECK (uses_remaining >= 0) NOT VALID;
  END IF;
END $$;

ALTER TABLE public.passes
  VALIDATE CONSTRAINT passes_uses_remaining_nonnegative;

GRANT SELECT, UPDATE ON TABLE public.passes TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_usage TO service_role;

CREATE OR REPLACE FUNCTION public.reserve_generation_access(
  p_user_id UUID,
  p_reservation_id UUID,
  p_report_kind TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
  v_hold_expires_at TIMESTAMPTZ := v_now + INTERVAL '15 minutes';
  v_existing private.generation_access_reservations%ROWTYPE;
  v_pass public.passes%ROWTYPE;
  v_free_used_at TIMESTAMPTZ;
  v_free_hold_count INTEGER := 0;
  v_free_uses_remaining INTEGER := 1;
  v_entitlement_kind TEXT;
BEGIN
  IF p_user_id IS NULL OR p_reservation_id IS NULL THEN
    RAISE EXCEPTION 'user id and reservation id are required';
  END IF;

  IF p_report_kind NOT IN ('resume_feedback', 'resume_ideas') THEN
    RAISE EXCEPTION 'unsupported report kind';
  END IF;

  -- Every authenticated access transition takes this lock first. It is the
  -- single serialization point for concurrent free and pass decisions.
  INSERT INTO public.user_usage (user_id, created_at, updated_at)
  VALUES (p_user_id, v_now, v_now)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT free_report_used_at
  INTO v_free_used_at
  FROM public.user_usage
  WHERE user_id = p_user_id
  FOR UPDATE;

  UPDATE private.generation_access_reservations
  SET
    status = 'expired',
    reason_code = 'reservation_expired',
    released_at = v_now,
    updated_at = v_now
  WHERE user_id = p_user_id
    AND status = 'reserved'
    AND expires_at <= v_now;

  -- An opaque UUID is the only idempotency key. Caller-provided request IDs,
  -- emails, IPs, resume hashes, and content never enter this ledger.
  SELECT *
  INTO v_existing
  FROM private.generation_access_reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF FOUND THEN
    IF v_existing.user_id <> p_user_id OR v_existing.report_kind <> p_report_kind THEN
      RAISE EXCEPTION 'reservation identity mismatch';
    END IF;

    RETURN jsonb_build_object(
      'allowed', v_existing.status = 'reserved',
      'reservation_id', v_existing.id,
      'status', v_existing.status,
      'access_tier', v_existing.access_tier,
      'entitlement_kind', v_existing.entitlement_kind,
      'free_uses_remaining', CASE
        WHEN v_free_used_at IS NULL AND v_existing.entitlement_kind <> 'free' THEN 1
        ELSE 0
      END,
      'pass', CASE
        WHEN v_existing.pass_id IS NULL THEN NULL
        ELSE (
          SELECT jsonb_build_object(
            'id', p.id,
            'tier', p.tier,
            'expires_at', p.expires_at,
            'uses_remaining', p.uses_remaining,
            'created_at', p.created_at
          )
          FROM public.passes AS p
          WHERE p.id = v_existing.pass_id
        )
      END
    );
  END IF;

  -- Unlimited access wins first. Otherwise a finite pass is eligible only
  -- when its uncommitted credit count exceeds its live reservation holds.
  SELECT p.*
  INTO v_pass
  FROM public.passes AS p
  WHERE p.user_id = p_user_id
    AND p.expires_at > v_now
    AND (
      p.tier IN ('monthly', 'lifetime')
      OR COALESCE(p.uses_remaining, 0) > (
        SELECT COUNT(*)
        FROM private.generation_access_reservations AS r
        WHERE r.pass_id = p.id
          AND r.status = 'reserved'
          AND r.expires_at > v_now
      )
    )
  ORDER BY
    CASE WHEN p.tier IN ('monthly', 'lifetime') THEN 0 ELSE 1 END,
    p.expires_at ASC,
    p.created_at DESC
  LIMIT 1
  FOR UPDATE OF p;

  IF FOUND THEN
    v_entitlement_kind := CASE
      WHEN v_pass.tier IN ('monthly', 'lifetime') THEN 'pass_unlimited'
      ELSE 'pass_credit'
    END;

    INSERT INTO private.generation_access_reservations (
      id,
      user_id,
      report_kind,
      entitlement_kind,
      access_tier,
      pass_id,
      status,
      reserved_at,
      expires_at
    ) VALUES (
      p_reservation_id,
      p_user_id,
      p_report_kind,
      v_entitlement_kind,
      'pass_full',
      v_pass.id,
      'reserved',
      v_now,
      v_hold_expires_at
    );

    IF v_free_used_at IS NULL THEN
      SELECT COUNT(*)
      INTO v_free_hold_count
      FROM private.generation_access_reservations
      WHERE user_id = p_user_id
        AND status = 'reserved'
        AND entitlement_kind = 'free'
        AND expires_at > v_now;

      v_free_uses_remaining := CASE WHEN v_free_hold_count = 0 THEN 1 ELSE 0 END;
    ELSE
      v_free_uses_remaining := 0;
    END IF;

    RETURN jsonb_build_object(
      'allowed', TRUE,
      'reservation_id', p_reservation_id,
      'status', 'reserved',
      'access_tier', 'pass_full',
      'entitlement_kind', v_entitlement_kind,
      'free_uses_remaining', v_free_uses_remaining,
      'pass', jsonb_build_object(
        'id', v_pass.id,
        'tier', v_pass.tier,
        'expires_at', v_pass.expires_at,
        'uses_remaining', v_pass.uses_remaining,
        'created_at', v_pass.created_at
      )
    );
  END IF;

  SELECT COUNT(*)
  INTO v_free_hold_count
  FROM private.generation_access_reservations
  WHERE user_id = p_user_id
    AND status = 'reserved'
    AND entitlement_kind = 'free'
    AND expires_at > v_now;

  IF v_free_used_at IS NULL AND v_free_hold_count = 0 THEN
    INSERT INTO private.generation_access_reservations (
      id,
      user_id,
      report_kind,
      entitlement_kind,
      access_tier,
      status,
      reserved_at,
      expires_at
    ) VALUES (
      p_reservation_id,
      p_user_id,
      p_report_kind,
      'free',
      'free_full',
      'reserved',
      v_now,
      v_hold_expires_at
    );

    RETURN jsonb_build_object(
      'allowed', TRUE,
      'reservation_id', p_reservation_id,
      'status', 'reserved',
      'access_tier', 'free_full',
      'entitlement_kind', 'free',
      'free_uses_remaining', 0,
      'pass', NULL
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', FALSE,
    'reservation_id', NULL,
    'status', 'denied',
    'access_tier', 'preview',
    'entitlement_kind', NULL,
    'free_uses_remaining', 0,
    'pass', NULL
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.commit_generation_access(
  p_user_id UUID,
  p_reservation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
  v_reservation private.generation_access_reservations%ROWTYPE;
  v_remaining_uses INTEGER;
BEGIN
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
    RETURN jsonb_build_object('ok', FALSE, 'status', 'missing');
  END IF;

  IF v_reservation.status = 'committed' THEN
    RETURN jsonb_build_object('ok', TRUE, 'status', 'committed');
  END IF;

  IF v_reservation.status <> 'reserved' THEN
    RETURN jsonb_build_object('ok', FALSE, 'status', v_reservation.status);
  END IF;

  IF v_reservation.expires_at <= v_now THEN
    UPDATE private.generation_access_reservations
    SET
      status = 'expired',
      reason_code = 'reservation_expired',
      released_at = v_now,
      updated_at = v_now
    WHERE id = p_reservation_id;

    RETURN jsonb_build_object('ok', FALSE, 'status', 'expired');
  END IF;

  IF v_reservation.entitlement_kind = 'free' THEN
    UPDATE public.user_usage
    SET
      free_report_used_at = v_now,
      updated_at = v_now
    WHERE user_id = p_user_id
      AND free_report_used_at IS NULL;

    IF NOT FOUND THEN
      UPDATE private.generation_access_reservations
      SET
        status = 'released',
        reason_code = 'commit_conflict',
        released_at = v_now,
        updated_at = v_now
      WHERE id = p_reservation_id;

      RETURN jsonb_build_object('ok', FALSE, 'status', 'released');
    END IF;
  ELSIF v_reservation.entitlement_kind = 'pass_credit' THEN
    UPDATE public.passes
    SET
      uses_remaining = uses_remaining - 1,
      updated_at = v_now
    WHERE id = v_reservation.pass_id
      AND user_id = p_user_id
      AND uses_remaining > 0
    RETURNING uses_remaining INTO v_remaining_uses;

    IF NOT FOUND THEN
      UPDATE private.generation_access_reservations
      SET
        status = 'released',
        reason_code = 'commit_conflict',
        released_at = v_now,
        updated_at = v_now
      WHERE id = p_reservation_id;

      RETURN jsonb_build_object('ok', FALSE, 'status', 'released');
    END IF;
  END IF;

  UPDATE private.generation_access_reservations
  SET
    status = 'committed',
    committed_at = v_now,
    updated_at = v_now
  WHERE id = p_reservation_id
    AND status = 'reserved';

  RETURN jsonb_build_object(
    'ok', TRUE,
    'status', 'committed',
    'remaining_uses', v_remaining_uses
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.release_generation_access(
  p_user_id UUID,
  p_reservation_id UUID,
  p_reason_code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
  v_reason_code TEXT;
  v_reservation private.generation_access_reservations%ROWTYPE;
  v_remaining_uses INTEGER;
BEGIN
  v_reason_code := CASE
    WHEN p_reason_code IN (
      'provider_error',
      'provider_timeout',
      'validation_error',
      'client_disconnect',
      'delivery_error',
      'internal_error'
    ) THEN p_reason_code
    ELSE 'internal_error'
  END;

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

  IF v_reservation.status IN ('released', 'refunded', 'expired') THEN
    RETURN jsonb_build_object('ok', TRUE, 'status', v_reservation.status, 'action', 'none');
  END IF;

  IF v_reservation.status = 'reserved' THEN
    UPDATE private.generation_access_reservations
    SET
      status = 'released',
      reason_code = v_reason_code,
      released_at = v_now,
      updated_at = v_now
    WHERE id = p_reservation_id
      AND status = 'reserved';

    RETURN jsonb_build_object('ok', TRUE, 'status', 'released', 'action', 'released');
  END IF;

  -- A failure after commit (for example, delivery closes before the complete
  -- event) may refund exactly once. The locked state transition prevents a
  -- retry from adding a second credit.
  IF v_reservation.entitlement_kind = 'free' THEN
    UPDATE public.user_usage
    SET
      free_report_used_at = NULL,
      updated_at = v_now
    WHERE user_id = p_user_id
      AND free_report_used_at = v_reservation.committed_at;

    IF NOT FOUND THEN
      UPDATE private.generation_access_reservations
      SET reason_code = 'refund_conflict', updated_at = v_now
      WHERE id = p_reservation_id;

      RETURN jsonb_build_object('ok', FALSE, 'status', 'committed', 'action', 'none');
    END IF;
  ELSIF v_reservation.entitlement_kind = 'pass_credit' THEN
    UPDATE public.passes
    SET
      uses_remaining = uses_remaining + 1,
      updated_at = v_now
    WHERE id = v_reservation.pass_id
      AND user_id = p_user_id
    RETURNING uses_remaining INTO v_remaining_uses;

    IF NOT FOUND THEN
      UPDATE private.generation_access_reservations
      SET reason_code = 'refund_conflict', updated_at = v_now
      WHERE id = p_reservation_id;

      RETURN jsonb_build_object('ok', FALSE, 'status', 'committed', 'action', 'none');
    END IF;
  END IF;

  UPDATE private.generation_access_reservations
  SET
    status = 'refunded',
    reason_code = v_reason_code,
    refunded_at = v_now,
    updated_at = v_now
  WHERE id = p_reservation_id
    AND status = 'committed';

  RETURN jsonb_build_object(
    'ok', TRUE,
    'status', 'refunded',
    'action', 'refunded',
    'remaining_uses', v_remaining_uses
  );
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_generation_access(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.commit_generation_access(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_generation_access(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.reserve_generation_access(UUID, UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.commit_generation_access(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_generation_access(UUID, UUID, TEXT) TO service_role;

COMMENT ON TABLE private.generation_access_reservations IS
  'Opaque, short-lived access holds. Never stores request IDs, email, IP, resume text, job text, provider output, or raw errors.';
