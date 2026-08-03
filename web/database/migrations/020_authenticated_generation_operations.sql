-- Durable authenticated operation idempotency. Browser operation IDs never
-- become entitlement reservation IDs; one atomic begin transition creates the
-- server reservation and grants provider execution to exactly one caller.

CREATE TABLE IF NOT EXISTS private.generation_operations (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_id UUID PRIMARY KEY,
  report_kind TEXT NOT NULL,
  request_digest VARCHAR(64) NOT NULL,
  reservation_id UUID UNIQUE REFERENCES private.generation_access_reservations(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT generation_operation_kind_check CHECK (report_kind = 'resume_feedback'),
  CONSTRAINT generation_operation_digest_check CHECK (request_digest ~ '^[0-9a-f]{64}$'),
  CONSTRAINT generation_operation_status_check CHECK (status IN ('executing', 'committed', 'terminal', 'denied')),
  CONSTRAINT generation_operation_reservation_shape_check CHECK (
    (status = 'denied' AND reservation_id IS NULL)
    OR (status <> 'denied' AND reservation_id IS NOT NULL)
  )
);

ALTER TABLE private.generation_operations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE private.generation_operations FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE private.generation_operations TO service_role;

-- The original authenticated reservation RPC remains available for resume
-- ideas, but resume-feedback holds can only be minted inside the operation
-- transaction below. The internal primitive is not callable by service_role.
ALTER FUNCTION public.reserve_generation_access(UUID, UUID, TEXT) SET SCHEMA private;
ALTER FUNCTION private.reserve_generation_access(UUID, UUID, TEXT)
  RENAME TO reserve_generation_access_internal;
REVOKE ALL ON FUNCTION private.reserve_generation_access_internal(UUID, UUID, TEXT)
  FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.reserve_generation_access(
  p_user_id UUID,
  p_reservation_id UUID,
  p_report_kind TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_report_kind IS DISTINCT FROM 'resume_ideas' THEN
    RAISE EXCEPTION 'direct resume feedback reservation is forbidden'
      USING ERRCODE = '42501';
  END IF;
  RETURN private.reserve_generation_access_internal(
    p_user_id, p_reservation_id, p_report_kind
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.begin_generation_operation(
  p_user_id UUID,
  p_operation_id UUID,
  p_report_kind TEXT,
  p_request_digest TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_operation private.generation_operations%ROWTYPE;
  v_reservation private.generation_access_reservations%ROWTYPE;
  v_reservation_id UUID;
  v_access JSONB;
  v_report_final BOOLEAN := FALSE;
BEGIN
  IF p_user_id IS NULL OR p_operation_id IS NULL
    OR p_report_kind <> 'resume_feedback'
    OR p_request_digest IS NULL OR p_request_digest !~ '^[0-9a-f]{64}$'
  THEN
    RAISE EXCEPTION 'invalid generation operation';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_operation_id::TEXT, 0)
  );

  SELECT * INTO v_operation
  FROM private.generation_operations
  WHERE operation_id = p_operation_id
  FOR UPDATE;

  IF FOUND THEN
    IF v_operation.user_id <> p_user_id
      OR v_operation.report_kind <> p_report_kind
      OR v_operation.request_digest <> p_request_digest THEN
      RETURN jsonb_build_object('allowed', FALSE, 'operation_state', 'conflict');
    END IF;
    IF v_operation.status = 'denied' THEN
      RETURN jsonb_build_object(
        'allowed', FALSE, 'operation_state', 'denied', 'status', 'denied'
      );
    END IF;
    SELECT * INTO v_reservation
    FROM private.generation_access_reservations
    WHERE id = v_operation.reservation_id AND user_id = p_user_id
    FOR UPDATE;
    IF NOT FOUND THEN
      UPDATE private.generation_operations SET status = 'terminal', updated_at = clock_timestamp()
      WHERE operation_id = p_operation_id;
      RETURN jsonb_build_object('allowed', FALSE, 'operation_state', 'terminal', 'status', 'missing');
    END IF;

    IF v_reservation.status = 'committed' AND v_reservation.report_id IS NOT NULL THEN
      SELECT EXISTS (
        SELECT 1 FROM public.reports
        WHERE id = v_reservation.report_id AND user_id = p_user_id
      ) INTO v_report_final;
      IF v_report_final THEN
        UPDATE private.generation_operations
        SET status = 'committed', report_id = v_reservation.report_id, updated_at = clock_timestamp()
        WHERE operation_id = p_operation_id;
        RETURN jsonb_build_object(
          'allowed', FALSE, 'operation_state', 'committed', 'status', 'committed',
          'reservation_id', v_reservation.id, 'report_id', v_reservation.report_id,
          'report_final', TRUE, 'access_tier', v_reservation.access_tier,
          'entitlement_kind', v_reservation.entitlement_kind
        );
      END IF;
    END IF;

    IF v_reservation.status = 'reserved' AND v_reservation.expires_at > clock_timestamp() THEN
      RETURN jsonb_build_object(
        'allowed', FALSE, 'operation_state', 'pending', 'status', 'reserved',
        'reservation_id', v_reservation.id, 'access_tier', v_reservation.access_tier,
        'entitlement_kind', v_reservation.entitlement_kind
      );
    END IF;

    UPDATE private.generation_operations SET status = 'terminal', updated_at = clock_timestamp()
    WHERE operation_id = p_operation_id;
    RETURN jsonb_build_object(
      'allowed', FALSE, 'operation_state', 'terminal', 'status', v_reservation.status,
      'reservation_id', v_reservation.id
    );
  END IF;

  v_reservation_id := gen_random_uuid();
  v_access := private.reserve_generation_access_internal(
    p_user_id, v_reservation_id, p_report_kind
  );
  INSERT INTO private.generation_operations (
    user_id, operation_id, report_kind, request_digest, reservation_id, status
  ) VALUES (
    p_user_id, p_operation_id, p_report_kind, p_request_digest,
    CASE WHEN (v_access->>'allowed')::BOOLEAN THEN v_reservation_id ELSE NULL END,
    CASE WHEN (v_access->>'allowed')::BOOLEAN THEN 'executing' ELSE 'denied' END
  );
  RETURN v_access || jsonb_build_object(
    'operation_state', CASE WHEN (v_access->>'allowed')::BOOLEAN THEN 'execute' ELSE 'denied' END
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_generation_operation_status(
  p_user_id UUID,
  p_operation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_operation private.generation_operations%ROWTYPE;
  v_reservation private.generation_access_reservations%ROWTYPE;
  v_report_final BOOLEAN := FALSE;
BEGIN
  IF p_user_id IS NULL OR p_operation_id IS NULL THEN
    RAISE EXCEPTION 'invalid generation operation lookup';
  END IF;

  SELECT * INTO v_operation
  FROM private.generation_operations
  WHERE operation_id = p_operation_id;

  IF NOT FOUND OR v_operation.user_id <> p_user_id THEN
    RETURN jsonb_build_object('found', FALSE);
  END IF;
  IF v_operation.status = 'denied' THEN
    RETURN jsonb_build_object('found', TRUE, 'operation_state', 'terminal');
  END IF;

  SELECT * INTO v_reservation
  FROM private.generation_access_reservations
  WHERE id = v_operation.reservation_id AND user_id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', TRUE, 'operation_state', 'terminal');
  END IF;

  IF v_reservation.status = 'committed' AND v_reservation.report_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.reports
      WHERE id = v_reservation.report_id AND user_id = p_user_id
    ) INTO v_report_final;
    RETURN jsonb_build_object(
      'found', TRUE,
      'operation_state', CASE WHEN v_report_final THEN 'committed' ELSE 'gone' END,
      'report_id', CASE WHEN v_report_final THEN v_reservation.report_id ELSE NULL END
    );
  END IF;
  IF v_reservation.status = 'reserved' AND v_reservation.expires_at > clock_timestamp() THEN
    RETURN jsonb_build_object('found', TRUE, 'operation_state', 'pending');
  END IF;
  RETURN jsonb_build_object('found', TRUE, 'operation_state', 'terminal');
END;
$$;

CREATE OR REPLACE FUNCTION private.sync_generation_operation_state()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'committed' AND NEW.report_id IS NOT NULL THEN
    UPDATE private.generation_operations
    SET status = 'committed', report_id = NEW.report_id, updated_at = clock_timestamp()
    WHERE reservation_id = NEW.id;
  ELSIF NEW.status IN ('released', 'refunded', 'expired') THEN
    UPDATE private.generation_operations
    SET status = 'terminal', updated_at = clock_timestamp()
    WHERE reservation_id = NEW.id AND status = 'executing';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_generation_operation_state
  ON private.generation_access_reservations;
CREATE TRIGGER sync_generation_operation_state
  AFTER UPDATE OF status, report_id ON private.generation_access_reservations
  FOR EACH ROW EXECUTE FUNCTION private.sync_generation_operation_state();

REVOKE ALL ON FUNCTION public.begin_generation_operation(UUID, UUID, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_generation_operation_status(UUID, UUID)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reserve_generation_access(UUID, UUID, TEXT)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.sync_generation_operation_state()
  FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.begin_generation_operation(UUID, UUID, TEXT, TEXT)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.get_generation_operation_status(UUID, UUID)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.reserve_generation_access(UUID, UUID, TEXT)
  TO service_role;

COMMENT ON TABLE private.generation_operations IS
  'Opaque authenticated operation keys bound to request digests and server reservations; stores no resume or job content.';
