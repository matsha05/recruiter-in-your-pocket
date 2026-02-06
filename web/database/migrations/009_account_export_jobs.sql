-- Account data export job tracking for asynchronous portability flows.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.account_export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  format TEXT NOT NULL DEFAULT 'json',
  result_json JSONB,
  file_path TEXT,
  file_url TEXT,
  error_message TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.account_export_jobs ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.account_export_jobs ADD COLUMN IF NOT EXISTS format TEXT NOT NULL DEFAULT 'json';
ALTER TABLE public.account_export_jobs ADD COLUMN IF NOT EXISTS result_json JSONB;
ALTER TABLE public.account_export_jobs ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE public.account_export_jobs ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.account_export_jobs ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE public.account_export_jobs ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.account_export_jobs ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE public.account_export_jobs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.account_export_jobs ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.account_export_jobs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.account_export_jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'account_export_jobs_status_check'
      AND conrelid = 'public.account_export_jobs'::regclass
  ) THEN
    ALTER TABLE public.account_export_jobs
      ADD CONSTRAINT account_export_jobs_status_check
      CHECK (status IN ('pending', 'running', 'completed', 'failed', 'expired'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS account_export_jobs_user_requested_idx
  ON public.account_export_jobs (user_id, requested_at DESC);
CREATE INDEX IF NOT EXISTS account_export_jobs_status_idx
  ON public.account_export_jobs (status);

ALTER TABLE public.account_export_jobs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'account_export_jobs' AND policyname = 'account_export_jobs_owner_select') THEN
    CREATE POLICY account_export_jobs_owner_select ON public.account_export_jobs FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'account_export_jobs' AND policyname = 'account_export_jobs_owner_insert') THEN
    CREATE POLICY account_export_jobs_owner_insert ON public.account_export_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'account_export_jobs' AND policyname = 'account_export_jobs_owner_update') THEN
    CREATE POLICY account_export_jobs_owner_update ON public.account_export_jobs FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'account_export_jobs' AND policyname = 'account_export_jobs_owner_delete') THEN
    CREATE POLICY account_export_jobs_owner_delete ON public.account_export_jobs FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
