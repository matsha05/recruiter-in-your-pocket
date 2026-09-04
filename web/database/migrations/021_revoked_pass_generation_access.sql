-- Revocation remains authoritative even if an older webhook restored a pass's
-- expiry/credit fields. Preserve migration 020's private reservation primitive
-- and public operation boundary; this is the existing reservation algorithm
-- with an explicit revocation filter and a guard for reused ideas holds.
--
-- Forward-only, no stored reports or balances are changed. Apply before or with
-- the matching webhook guard. Rolling back application code is safe while this
-- migration remains; reverting these guards would reopen revoked access.

CREATE OR REPLACE FUNCTION private.reserve_generation_access_internal(
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

    -- Reusing an ideas reservation must not authorize provider execution after
    -- its paid entitlement was revoked. New report operations never reuse this
    -- internal reservation key, but share the same revocation boundary below.
    IF v_existing.status = 'reserved' AND v_existing.pass_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.passes
        WHERE id = v_existing.pass_id AND revoked_at IS NOT NULL
      ) THEN
      UPDATE private.generation_access_reservations
      SET status = 'released', reason_code = 'commit_conflict',
        released_at = v_now, updated_at = v_now
      WHERE id = v_existing.id;
      v_existing.status := 'released';
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
    AND p.revoked_at IS NULL
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

REVOKE ALL ON FUNCTION private.reserve_generation_access_internal(UUID, UUID, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;

-- A refund may arrive after a model run obtained its hold. Protect both ideas
-- commit and atomic report finalization at their shared ledger transition. The
-- pass row lock serializes revocation against commit; raising here rolls back
-- all report inserts/credit updates in the finalization transaction.
CREATE OR REPLACE FUNCTION private.require_unrevoked_generation_pass()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF OLD.status = 'reserved' AND NEW.status = 'committed'
    AND NEW.entitlement_kind IN ('pass_credit', 'pass_unlimited') THEN
    PERFORM 1
    FROM public.passes
    WHERE id = NEW.pass_id AND user_id = NEW.user_id AND revoked_at IS NULL
    FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'generation pass was revoked or is unavailable';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.require_unrevoked_generation_pass()
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TRIGGER generation_access_require_unrevoked_pass
BEFORE UPDATE OF status ON private.generation_access_reservations
FOR EACH ROW EXECUTE FUNCTION private.require_unrevoked_generation_pass();
