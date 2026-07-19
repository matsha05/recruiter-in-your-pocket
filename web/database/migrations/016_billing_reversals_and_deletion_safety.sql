-- Preserve entitlement integrity across refunds, disputes, restores, and
-- account deletion without retaining a user identity in the block ledger.

ALTER TABLE public.passes
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS revocation_reason TEXT;

CREATE INDEX IF NOT EXISTS passes_payment_intent_idx
  ON public.passes (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS passes_stripe_customer_idx
  ON public.passes (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.billing_entitlement_blocks (
  checkout_session_id TEXT PRIMARY KEY,
  stripe_payment_intent_id TEXT,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT billing_entitlement_blocks_reason_check
    CHECK (reason IN ('account_deleted', 'refund', 'dispute'))
);

CREATE INDEX IF NOT EXISTS billing_entitlement_blocks_payment_intent_idx
  ON public.billing_entitlement_blocks (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

ALTER TABLE public.billing_entitlement_blocks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.billing_entitlement_blocks FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.billing_entitlement_blocks TO service_role;

GRANT DELETE ON TABLE private.generation_access_reservations TO service_role;

CREATE OR REPLACE FUNCTION public.delete_generation_access_reservations_for_user(
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user id is required';
  END IF;

  DELETE FROM private.generation_access_reservations
  WHERE user_id = p_user_id;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_generation_access_reservations_for_user(UUID)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_generation_access_reservations_for_user(UUID)
  TO service_role;

COMMENT ON TABLE public.billing_entitlement_blocks IS
  'Non-user-linked entitlement tombstones preventing refunded, disputed, or deleted purchases from being regranted.';
