-- Atomically claim Stripe webhook events. A unique event id prevents duplicate
-- rows; a short ownership lease prevents concurrent deliveries from both
-- performing fulfillment. Billing should remain disabled while this migration
-- is applied because legacy `processing` rows did not carry ownership tokens.

ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Older code stored subscription ids in price_id. Preserve those links for
-- lifecycle updates, while all new rows keep the canonical Stripe price id in
-- price_id and the subscription id in its own column.
UPDATE public.passes
SET stripe_subscription_id = price_id
WHERE tier = 'monthly'
  AND stripe_subscription_id IS NULL
  AND left(price_id, 4) = 'sub_';

CREATE INDEX IF NOT EXISTS passes_stripe_subscription_id_idx
  ON public.passes (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

ALTER TABLE public.stripe_events ADD COLUMN IF NOT EXISTS lease_token UUID;
ALTER TABLE public.stripe_events ADD COLUMN IF NOT EXISTS lease_expires_at TIMESTAMPTZ;

UPDATE public.stripe_events
SET
  status = 'failed',
  last_error = COALESCE(last_error, 'Lease migration reclaimed an unowned processing attempt.'),
  updated_at = NOW()
WHERE status = 'processing' AND lease_token IS NULL;

ALTER TABLE public.stripe_events DROP CONSTRAINT IF EXISTS stripe_events_status_check;
ALTER TABLE public.stripe_events
  ADD CONSTRAINT stripe_events_status_check
  CHECK (status IN ('processing', 'completed', 'failed', 'rejected'));

CREATE INDEX IF NOT EXISTS stripe_events_active_lease_idx
  ON public.stripe_events (lease_expires_at)
  WHERE status = 'processing';

CREATE OR REPLACE FUNCTION public.claim_stripe_event(
  p_event_id TEXT,
  p_event_type TEXT,
  p_payload JSONB,
  p_request_id TEXT,
  p_lease_token UUID,
  p_lease_seconds INTEGER DEFAULT 300
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
  v_lease_expires_at TIMESTAMPTZ;
  v_event public.stripe_events%ROWTYPE;
BEGIN
  IF p_event_id IS NULL OR btrim(p_event_id) = '' OR length(p_event_id) > 255 THEN
    RAISE EXCEPTION 'Invalid Stripe event id';
  END IF;
  IF p_event_type IS NULL OR btrim(p_event_type) = '' OR length(p_event_type) > 255 THEN
    RAISE EXCEPTION 'Invalid Stripe event type';
  END IF;
  IF p_lease_token IS NULL THEN
    RAISE EXCEPTION 'Stripe event lease token is required';
  END IF;

  v_lease_expires_at := v_now + make_interval(
    secs => greatest(30, least(coalesce(p_lease_seconds, 300), 900))
  );

  INSERT INTO public.stripe_events (
    event_id,
    event_type,
    status,
    attempts,
    processed_at,
    payload,
    request_id,
    updated_at,
    lease_token,
    lease_expires_at
  )
  VALUES (
    p_event_id,
    p_event_type,
    'processing',
    1,
    NULL,
    coalesce(p_payload, '{}'::jsonb),
    p_request_id,
    v_now,
    p_lease_token,
    v_lease_expires_at
  )
  ON CONFLICT (event_id) DO NOTHING
  RETURNING * INTO v_event;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'claimed', true,
      'reason', 'new',
      'lease_expires_at', v_lease_expires_at
    );
  END IF;

  SELECT *
  INTO v_event
  FROM public.stripe_events
  WHERE event_id = p_event_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stripe event disappeared during claim';
  END IF;
  IF v_event.event_type <> p_event_type THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'event_mismatch');
  END IF;
  IF v_event.status IN ('completed', 'rejected') THEN
    RETURN jsonb_build_object('claimed', false, 'reason', v_event.status);
  END IF;
  IF
    v_event.status = 'processing'
    AND v_event.lease_token IS NOT NULL
    AND v_event.lease_expires_at > v_now
  THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'leased');
  END IF;

  UPDATE public.stripe_events
  SET
    status = 'processing',
    attempts = greatest(1, coalesce(attempts, 0)) + 1,
    last_error = NULL,
    completed_at = NULL,
    payload = coalesce(p_payload, payload),
    request_id = p_request_id,
    updated_at = v_now,
    lease_token = p_lease_token,
    lease_expires_at = v_lease_expires_at
  WHERE event_id = p_event_id;

  RETURN jsonb_build_object(
    'claimed', true,
    'reason', 'retry',
    'lease_expires_at', v_lease_expires_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_stripe_event(
  p_event_id TEXT,
  p_lease_token UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.stripe_events
  SET
    status = 'completed',
    processed_at = clock_timestamp(),
    completed_at = clock_timestamp(),
    last_error = NULL,
    updated_at = clock_timestamp(),
    lease_token = NULL,
    lease_expires_at = NULL
  WHERE event_id = p_event_id
    AND status = 'processing'
    AND lease_token = p_lease_token;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_stripe_event(
  p_event_id TEXT,
  p_lease_token UUID,
  p_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.stripe_events
  SET
    status = 'rejected',
    processed_at = clock_timestamp(),
    completed_at = clock_timestamp(),
    last_error = left(coalesce(p_reason, 'Rejected Stripe event'), 500),
    updated_at = clock_timestamp(),
    lease_token = NULL,
    lease_expires_at = NULL
  WHERE event_id = p_event_id
    AND status = 'processing'
    AND lease_token = p_lease_token;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.fail_stripe_event(
  p_event_id TEXT,
  p_lease_token UUID,
  p_error TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.stripe_events
  SET
    status = 'failed',
    last_error = left(coalesce(p_error, 'Webhook processing failed'), 500),
    updated_at = clock_timestamp(),
    lease_token = NULL,
    lease_expires_at = NULL
  WHERE event_id = p_event_id
    AND status = 'processing'
    AND lease_token = p_lease_token;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_stripe_event(TEXT, TEXT, JSONB, TEXT, UUID, INTEGER)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_stripe_event(TEXT, UUID)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reject_stripe_event(TEXT, UUID, TEXT)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fail_stripe_event(TEXT, UUID, TEXT)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.claim_stripe_event(TEXT, TEXT, JSONB, TEXT, UUID, INTEGER)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_stripe_event(TEXT, UUID)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.reject_stripe_event(TEXT, UUID, TEXT)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.fail_stripe_event(TEXT, UUID, TEXT)
  TO service_role;
