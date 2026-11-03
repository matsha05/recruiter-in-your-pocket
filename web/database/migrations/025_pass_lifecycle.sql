-- One lifecycle for a purchased pass, enforced at the table so every writer
-- (webhook, return-URL confirm, restore, account deletion, future code) meets
-- the same rules instead of each re-deriving them:
--
--   granted --(credits spent)--> used ----+
--      |                                  +--> expired
--      +--(refund | dispute | account_deleted)--> revoked   [terminal]
--
-- Rules the database now holds:
--   * A checkout session or payment intent with an entitlement block can never
--     grant a pass again. The insert trigger refuses it.
--   * Writing revoked_at zeroes credits and ends expiry in the same write, so a
--     revoked row cannot look active to any reader.
--   * revoked_at never returns to NULL, whatever the writer intended.
--   * Inserting a block revokes every pass for that session or payment intent,
--     so "block then revoke" cannot leave a pass behind.
--   * fulfill_checkout_pass is the single grant transition and
--     revoke_checkout_entitlements the single reversal transition. Both, and
--     the pass insert trigger, take a transaction-scoped advisory lock on the
--     checkout session, so a grant and a reversal for the same purchase cannot
--     interleave between "check" and "write".

CREATE OR REPLACE FUNCTION private.lock_checkout_session(p_checkout_session_id TEXT)
RETURNS VOID
LANGUAGE sql
SET search_path = ''
AS $$
  SELECT pg_advisory_xact_lock(hashtext('riyp:checkout:' || p_checkout_session_id));
$$;

REVOKE ALL ON FUNCTION private.lock_checkout_session(TEXT)
  FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION private.pass_lifecycle_json(p public.passes)
RETURNS JSONB
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'id', p.id,
    'user_id', p.user_id,
    'tier', p.tier,
    'uses_remaining', p.uses_remaining,
    'expires_at', p.expires_at,
    'revoked_at', p.revoked_at,
    'revocation_reason', p.revocation_reason,
    'checkout_session_id', p.checkout_session_id,
    'stripe_subscription_id', p.stripe_subscription_id
  );
$$;

REVOKE ALL ON FUNCTION private.pass_lifecycle_json(public.passes)
  FROM PUBLIC, anon, authenticated, service_role;

-- Repair rows written before the lifecycle was enforced: a revocation that
-- left credits or a future expiry behind, and a pass granted after its
-- session was blocked (the check-then-insert race this migration closes).
UPDATE public.passes AS p
SET revoked_at = b.created_at,
    revocation_reason = b.reason,
    uses_remaining = 0,
    expires_at = LEAST(p.expires_at, b.created_at),
    updated_at = NOW()
FROM public.billing_entitlement_blocks AS b
WHERE p.revoked_at IS NULL
  AND (
    p.checkout_session_id = b.checkout_session_id
    OR (p.stripe_payment_intent_id IS NOT NULL
      AND p.stripe_payment_intent_id = b.stripe_payment_intent_id)
  );

UPDATE public.passes
SET uses_remaining = 0,
    expires_at = LEAST(expires_at, revoked_at),
    updated_at = NOW()
WHERE revoked_at IS NOT NULL
  AND (uses_remaining <> 0 OR expires_at > revoked_at);

ALTER TABLE public.passes DROP CONSTRAINT IF EXISTS passes_revoked_shape_check;
ALTER TABLE public.passes
  ADD CONSTRAINT passes_revoked_shape_check
  CHECK (revoked_at IS NULL OR (uses_remaining = 0 AND expires_at <= revoked_at));

CREATE OR REPLACE FUNCTION private.enforce_pass_lifecycle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_block_reason TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.checkout_session_id IS NOT NULL THEN
      PERFORM private.lock_checkout_session(NEW.checkout_session_id);
      SELECT reason INTO v_block_reason
      FROM public.billing_entitlement_blocks
      WHERE checkout_session_id = NEW.checkout_session_id;
      IF FOUND THEN
        RAISE EXCEPTION 'pass_checkout_blocked: %', v_block_reason
          USING ERRCODE = 'check_violation';
      END IF;
    END IF;
    IF NEW.stripe_payment_intent_id IS NOT NULL THEN
      SELECT reason INTO v_block_reason
      FROM public.billing_entitlement_blocks
      WHERE stripe_payment_intent_id = NEW.stripe_payment_intent_id
      LIMIT 1;
      IF FOUND THEN
        RAISE EXCEPTION 'pass_checkout_blocked: %', v_block_reason
          USING ERRCODE = 'check_violation';
      END IF;
    END IF;
  ELSIF OLD.revoked_at IS NOT NULL THEN
    IF NEW.revoked_at IS NULL THEN
      RAISE EXCEPTION 'pass_revocation_is_final'
        USING ERRCODE = 'check_violation';
    END IF;
    NEW.revoked_at := OLD.revoked_at;
    NEW.revocation_reason := COALESCE(OLD.revocation_reason, NEW.revocation_reason);
  END IF;

  IF NEW.revoked_at IS NOT NULL THEN
    NEW.uses_remaining := 0;
    NEW.expires_at := LEAST(NEW.expires_at, NEW.revoked_at);
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.enforce_pass_lifecycle()
  FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS passes_enforce_lifecycle ON public.passes;
CREATE TRIGGER passes_enforce_lifecycle
BEFORE INSERT OR UPDATE ON public.passes
FOR EACH ROW EXECUTE FUNCTION private.enforce_pass_lifecycle();

CREATE OR REPLACE FUNCTION private.revoke_passes_for_entitlement_block()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM private.lock_checkout_session(NEW.checkout_session_id);
  UPDATE public.passes
  SET revoked_at = NOW(),
      revocation_reason = NEW.reason,
      updated_at = NOW()
  WHERE revoked_at IS NULL
    AND (
      checkout_session_id = NEW.checkout_session_id
      OR (NEW.stripe_payment_intent_id IS NOT NULL
        AND stripe_payment_intent_id = NEW.stripe_payment_intent_id)
    );
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.revoke_passes_for_entitlement_block()
  FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS billing_entitlement_blocks_revoke_passes ON public.billing_entitlement_blocks;
CREATE TRIGGER billing_entitlement_blocks_revoke_passes
AFTER INSERT OR UPDATE ON public.billing_entitlement_blocks
FOR EACH ROW EXECUTE FUNCTION private.revoke_passes_for_entitlement_block();

-- The grant transition. Outcomes:
--   created   a new pass row was inserted
--   existing  this checkout session already has a pass (idempotent replay)
--   renewed   the user's unrevoked pass on this subscription was extended
--   blocked   the session, its payment intent, or the subscription's pass was
--             reversed; nothing is written
CREATE OR REPLACE FUNCTION public.fulfill_checkout_pass(
  p_user_id UUID,
  p_checkout_session_id TEXT,
  p_tier TEXT,
  p_uses_remaining INTEGER,
  p_purchased_at TIMESTAMPTZ,
  p_expires_at TIMESTAMPTZ,
  p_price_id TEXT,
  p_stripe_subscription_id TEXT,
  p_stripe_payment_intent_id TEXT,
  p_stripe_customer_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_block_reason TEXT;
  v_pass public.passes%ROWTYPE;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  IF p_user_id IS NULL
    OR p_checkout_session_id IS NULL OR p_checkout_session_id = ''
    OR p_tier IS NULL OR p_tier = ''
    OR p_uses_remaining IS NULL OR p_uses_remaining < 0
    OR p_expires_at IS NULL THEN
    RAISE EXCEPTION 'checkout fulfillment input is incomplete'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  PERFORM private.lock_checkout_session(p_checkout_session_id);

  SELECT reason INTO v_block_reason
  FROM public.billing_entitlement_blocks
  WHERE checkout_session_id = p_checkout_session_id;
  IF FOUND THEN
    RETURN jsonb_build_object('outcome', 'blocked', 'reason', v_block_reason);
  END IF;

  IF p_stripe_payment_intent_id IS NOT NULL THEN
    SELECT reason INTO v_block_reason
    FROM public.billing_entitlement_blocks
    WHERE stripe_payment_intent_id = p_stripe_payment_intent_id
    LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object('outcome', 'blocked', 'reason', v_block_reason);
    END IF;
  END IF;

  SELECT * INTO v_pass
  FROM public.passes
  WHERE checkout_session_id = p_checkout_session_id
  LIMIT 1;
  IF FOUND THEN
    RETURN jsonb_build_object('outcome', 'existing', 'pass', private.pass_lifecycle_json(v_pass));
  END IF;

  IF p_stripe_subscription_id IS NOT NULL THEN
    SELECT * INTO v_pass
    FROM public.passes
    WHERE user_id = p_user_id
      AND stripe_subscription_id = p_stripe_subscription_id
    ORDER BY created_at DESC
    LIMIT 1
    FOR UPDATE;
    IF FOUND THEN
      IF v_pass.revoked_at IS NOT NULL THEN
        RETURN jsonb_build_object(
          'outcome', 'blocked',
          'reason', COALESCE(v_pass.revocation_reason, 'revoked')
        );
      END IF;
      UPDATE public.passes
      SET tier = p_tier,
          uses_remaining = p_uses_remaining,
          expires_at = p_expires_at,
          price_id = p_price_id,
          checkout_session_id = p_checkout_session_id,
          stripe_payment_intent_id = p_stripe_payment_intent_id,
          stripe_customer_id = p_stripe_customer_id,
          updated_at = v_now
      WHERE id = v_pass.id
      RETURNING * INTO v_pass;
      RETURN jsonb_build_object('outcome', 'renewed', 'pass', private.pass_lifecycle_json(v_pass));
    END IF;
  END IF;

  INSERT INTO public.passes (
    id, user_id, tier, uses_remaining, purchased_at, expires_at, price_id,
    stripe_subscription_id, checkout_session_id, stripe_payment_intent_id,
    stripe_customer_id, created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), p_user_id, p_tier, p_uses_remaining,
    COALESCE(p_purchased_at, v_now), p_expires_at, p_price_id,
    p_stripe_subscription_id, p_checkout_session_id, p_stripe_payment_intent_id,
    p_stripe_customer_id, v_now, v_now
  )
  RETURNING * INTO v_pass;

  RETURN jsonb_build_object('outcome', 'created', 'pass', private.pass_lifecycle_json(v_pass));
END;
$$;

REVOKE ALL ON FUNCTION public.fulfill_checkout_pass(
  UUID, TEXT, TEXT, INTEGER, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fulfill_checkout_pass(
  UUID, TEXT, TEXT, INTEGER, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT
) TO service_role;

-- The reversal transition. Blocks every named checkout session, revokes every
-- pass reached by session, payment intent, or subscription, and blocks the
-- sessions of those passes too so a later restore cannot regrant them.
-- Returns how many sessions are now blocked and how many passes this call
-- revoked; zero of both means the reversal matched nothing we know about.
CREATE OR REPLACE FUNCTION public.revoke_checkout_entitlements(
  p_checkout_session_ids TEXT[],
  p_stripe_payment_intent_id TEXT,
  p_stripe_subscription_id TEXT,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_session_ids TEXT[];
  v_session_id TEXT;
  v_revoked INTEGER := 0;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  IF p_reason IS NULL OR p_reason NOT IN ('refund', 'dispute', 'account_deleted') THEN
    RAISE EXCEPTION 'reversal reason is invalid'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  SELECT COALESCE(array_agg(DISTINCT s ORDER BY s), ARRAY[]::TEXT[])
  INTO v_session_ids
  FROM (
    SELECT unnest(COALESCE(p_checkout_session_ids, ARRAY[]::TEXT[])) AS s
    UNION
    SELECT checkout_session_id
    FROM public.passes
    WHERE checkout_session_id IS NOT NULL
      AND (
        (p_stripe_payment_intent_id IS NOT NULL
          AND stripe_payment_intent_id = p_stripe_payment_intent_id)
        OR (p_stripe_subscription_id IS NOT NULL
          AND stripe_subscription_id = p_stripe_subscription_id)
      )
  ) AS ids
  WHERE s IS NOT NULL AND s <> '';

  -- Lock in a stable order so two reversals for the same purchase cannot deadlock.
  FOREACH v_session_id IN ARRAY v_session_ids LOOP
    PERFORM private.lock_checkout_session(v_session_id);
  END LOOP;

  -- The block trigger revokes the passes of each session.
  INSERT INTO public.billing_entitlement_blocks (
    checkout_session_id, stripe_payment_intent_id, reason, updated_at
  )
  SELECT s, p_stripe_payment_intent_id, p_reason, v_now
  FROM unnest(v_session_ids) AS s
  ON CONFLICT (checkout_session_id) DO UPDATE
    SET stripe_payment_intent_id = COALESCE(EXCLUDED.stripe_payment_intent_id, public.billing_entitlement_blocks.stripe_payment_intent_id),
        reason = EXCLUDED.reason,
        updated_at = EXCLUDED.updated_at;

  -- Passes without a checkout session (legacy subscription rows) are reached
  -- directly by payment intent or subscription.
  UPDATE public.passes
  SET revoked_at = v_now,
      revocation_reason = p_reason,
      updated_at = v_now
  WHERE revoked_at IS NULL
    AND (
      (p_stripe_payment_intent_id IS NOT NULL
        AND stripe_payment_intent_id = p_stripe_payment_intent_id)
      OR (p_stripe_subscription_id IS NOT NULL
        AND stripe_subscription_id = p_stripe_subscription_id)
    );

  SELECT COUNT(*)::INTEGER INTO v_revoked
  FROM public.passes
  WHERE revoked_at = v_now
    AND revocation_reason = p_reason
    AND (
      checkout_session_id = ANY (v_session_ids)
      OR (p_stripe_payment_intent_id IS NOT NULL
        AND stripe_payment_intent_id = p_stripe_payment_intent_id)
      OR (p_stripe_subscription_id IS NOT NULL
        AND stripe_subscription_id = p_stripe_subscription_id)
    );

  RETURN jsonb_build_object(
    'blocked', COALESCE(array_length(v_session_ids, 1), 0),
    'revoked', v_revoked
  );
END;
$$;

REVOKE ALL ON FUNCTION public.revoke_checkout_entitlements(TEXT[], TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_checkout_entitlements(TEXT[], TEXT, TEXT, TEXT)
  TO service_role;

COMMENT ON FUNCTION public.fulfill_checkout_pass(
  UUID, TEXT, TEXT, INTEGER, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT
) IS 'The single grant transition of the pass lifecycle: created, existing, renewed, or blocked.';
COMMENT ON FUNCTION public.revoke_checkout_entitlements(TEXT[], TEXT, TEXT, TEXT)
  IS 'The single reversal transition of the pass lifecycle: blocks sessions and revokes passes atomically.';
