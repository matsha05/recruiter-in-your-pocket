-- Billing receipts table for invoice/receipt history and support tooling.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.billing_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  checkout_session_id TEXT,
  invoice_number TEXT,
  status TEXT,
  currency TEXT,
  amount_paid INTEGER NOT NULL DEFAULT 0,
  hosted_invoice_url TEXT,
  invoice_pdf TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.billing_receipts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.billing_receipts ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT;
ALTER TABLE public.billing_receipts ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.billing_receipts ADD COLUMN IF NOT EXISTS checkout_session_id TEXT;
ALTER TABLE public.billing_receipts ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE public.billing_receipts ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.billing_receipts ADD COLUMN IF NOT EXISTS currency TEXT;
ALTER TABLE public.billing_receipts ADD COLUMN IF NOT EXISTS amount_paid INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.billing_receipts ADD COLUMN IF NOT EXISTS hosted_invoice_url TEXT;
ALTER TABLE public.billing_receipts ADD COLUMN IF NOT EXISTS invoice_pdf TEXT;
ALTER TABLE public.billing_receipts ADD COLUMN IF NOT EXISTS period_start TIMESTAMPTZ;
ALTER TABLE public.billing_receipts ADD COLUMN IF NOT EXISTS period_end TIMESTAMPTZ;
ALTER TABLE public.billing_receipts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.billing_receipts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'billing_receipts'
      AND column_name = 'stripe_invoice_id'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE public.billing_receipts
      ALTER COLUMN stripe_invoice_id SET NOT NULL;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS billing_receipts_invoice_id_idx ON public.billing_receipts (stripe_invoice_id);
CREATE INDEX IF NOT EXISTS billing_receipts_user_created_idx ON public.billing_receipts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS billing_receipts_checkout_session_idx ON public.billing_receipts (checkout_session_id);

ALTER TABLE public.billing_receipts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'billing_receipts' AND policyname = 'billing_receipts_owner_select') THEN
    CREATE POLICY billing_receipts_owner_select ON public.billing_receipts FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'billing_receipts' AND policyname = 'billing_receipts_owner_insert') THEN
    CREATE POLICY billing_receipts_owner_insert ON public.billing_receipts FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'billing_receipts' AND policyname = 'billing_receipts_owner_update') THEN
    CREATE POLICY billing_receipts_owner_update ON public.billing_receipts FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'billing_receipts' AND policyname = 'billing_receipts_owner_delete') THEN
    CREATE POLICY billing_receipts_owner_delete ON public.billing_receipts FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
