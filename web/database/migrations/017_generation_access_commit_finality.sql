-- A committed report is final. Cleanup may release only a still-reserved hold;
-- it must never refund a free use or pass credit after commit.

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
  v_status TEXT;
BEGIN
  SELECT status
  INTO v_status
  FROM private.generation_access_reservations
  WHERE id = p_reservation_id
    AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', FALSE, 'status', 'missing', 'action', 'none');
  END IF;

  RETURN jsonb_build_object('ok', TRUE, 'status', v_status, 'action', 'none');
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

  SELECT *
  INTO v_reservation
  FROM private.generation_access_reservations
  WHERE id = p_reservation_id
    AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', FALSE, 'status', 'missing', 'action', 'none');
  END IF;

  IF v_reservation.status <> 'reserved' THEN
    RETURN jsonb_build_object(
      'ok', TRUE,
      'status', v_reservation.status,
      'action', 'none'
    );
  END IF;

  UPDATE private.generation_access_reservations
  SET
    status = 'released',
    reason_code = v_reason_code,
    released_at = v_now,
    updated_at = v_now
  WHERE id = p_reservation_id
    AND user_id = p_user_id
    AND status = 'reserved';

  RETURN jsonb_build_object(
    'ok', TRUE,
    'status', 'released',
    'action', 'released'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_generation_access_status(UUID, UUID)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_generation_access(UUID, UUID, TEXT)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_generation_access_status(UUID, UUID)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.release_generation_access(UUID, UUID, TEXT)
  TO service_role;

COMMENT ON FUNCTION public.release_generation_access(UUID, UUID, TEXT) IS
  'Releases reserved generation holds only. Committed entitlements are final and never refunded by cleanup.';
