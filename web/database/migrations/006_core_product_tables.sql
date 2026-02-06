-- Canonical core product tables used by runtime APIs.
-- Brings reports, passes, user_usage, and saved_jobs under migration control.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_hash VARCHAR(64),
  score INTEGER,
  score_label TEXT,
  report_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  resume_preview VARCHAR(200),
  name VARCHAR(100),
  job_description_preview VARCHAR(200),
  job_description_text TEXT,
  target_role VARCHAR(100),
  resume_variant VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resume_hash VARCHAR(64);
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS score INTEGER;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS score_label TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS report_json JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resume_preview VARCHAR(200);
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS name VARCHAR(100);
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS job_description_preview VARCHAR(200);
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS job_description_text TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS target_role VARCHAR(100);
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resume_variant VARCHAR(50);
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS reports_user_created_idx ON public.reports (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reports_user_variant_idx ON public.reports (user_id, resume_variant);
CREATE INDEX IF NOT EXISTS reports_user_target_role_idx ON public.reports (user_id, target_role);

CREATE TABLE IF NOT EXISTS public.passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  uses_remaining INTEGER NOT NULL DEFAULT 1,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  price_id TEXT,
  checkout_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS tier TEXT;
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS uses_remaining INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS price_id TEXT;
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS checkout_session_id TEXT;
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.passes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE public.passes
SET tier = COALESCE(NULLIF(TRIM(tier), ''), 'single_use')
WHERE tier IS NULL OR NULLIF(TRIM(tier), '') IS NULL;

UPDATE public.passes
SET uses_remaining = COALESCE(uses_remaining, 1)
WHERE uses_remaining IS NULL;

UPDATE public.passes
SET expires_at = COALESCE(expires_at, NOW())
WHERE expires_at IS NULL;

ALTER TABLE public.passes ALTER COLUMN tier SET NOT NULL;
ALTER TABLE public.passes ALTER COLUMN uses_remaining SET NOT NULL;
ALTER TABLE public.passes ALTER COLUMN expires_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS passes_user_expires_idx ON public.passes (user_id, expires_at DESC);
CREATE INDEX IF NOT EXISTS passes_price_id_idx ON public.passes (price_id);
CREATE UNIQUE INDEX IF NOT EXISTS passes_checkout_session_id_idx
  ON public.passes (checkout_session_id)
  WHERE checkout_session_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.user_usage (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  free_report_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_usage ADD COLUMN IF NOT EXISTS free_report_used_at TIMESTAMPTZ;
ALTER TABLE public.user_usage ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.user_usage ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  external_id TEXT,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  url TEXT NOT NULL,
  jd_text TEXT,
  job_description_text TEXT,
  jd_preview TEXT,
  source TEXT NOT NULL DEFAULT 'linkedin',
  status TEXT NOT NULL DEFAULT 'saved',
  match_score INTEGER,
  matched_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  top_gaps JSONB NOT NULL DEFAULT '[]'::jsonb,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.saved_jobs ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE public.saved_jobs ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.saved_jobs ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.saved_jobs ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.saved_jobs ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE public.saved_jobs ADD COLUMN IF NOT EXISTS jd_text TEXT;
ALTER TABLE public.saved_jobs ADD COLUMN IF NOT EXISTS job_description_text TEXT;
ALTER TABLE public.saved_jobs ADD COLUMN IF NOT EXISTS jd_preview TEXT;
ALTER TABLE public.saved_jobs ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'linkedin';
ALTER TABLE public.saved_jobs ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'saved';
ALTER TABLE public.saved_jobs ADD COLUMN IF NOT EXISTS match_score INTEGER;
ALTER TABLE public.saved_jobs ADD COLUMN IF NOT EXISTS matched_skills JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.saved_jobs ADD COLUMN IF NOT EXISTS missing_skills JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.saved_jobs ADD COLUMN IF NOT EXISTS top_gaps JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.saved_jobs ADD COLUMN IF NOT EXISTS captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.saved_jobs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.saved_jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'saved_jobs_status_check'
      AND conrelid = 'public.saved_jobs'::regclass
  ) THEN
    ALTER TABLE public.saved_jobs
      ADD CONSTRAINT saved_jobs_status_check
      CHECK (status IN ('saved', 'interested', 'applying', 'interviewing', 'archived'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS saved_jobs_user_url_idx ON public.saved_jobs (user_id, url);
CREATE INDEX IF NOT EXISTS saved_jobs_user_captured_idx ON public.saved_jobs (user_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS saved_jobs_user_external_idx ON public.saved_jobs (user_id, external_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS touch_reports_updated_at ON public.reports;
CREATE TRIGGER touch_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS touch_passes_updated_at ON public.passes;
CREATE TRIGGER touch_passes_updated_at
  BEFORE UPDATE ON public.passes
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS touch_user_usage_updated_at ON public.user_usage;
CREATE TRIGGER touch_user_usage_updated_at
  BEFORE UPDATE ON public.user_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS touch_saved_jobs_updated_at ON public.saved_jobs;
CREATE TRIGGER touch_saved_jobs_updated_at
  BEFORE UPDATE ON public.saved_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reports' AND policyname = 'reports_owner_select') THEN
    CREATE POLICY reports_owner_select ON public.reports FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reports' AND policyname = 'reports_owner_insert') THEN
    CREATE POLICY reports_owner_insert ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reports' AND policyname = 'reports_owner_update') THEN
    CREATE POLICY reports_owner_update ON public.reports FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reports' AND policyname = 'reports_owner_delete') THEN
    CREATE POLICY reports_owner_delete ON public.reports FOR DELETE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'passes' AND policyname = 'passes_owner_select') THEN
    CREATE POLICY passes_owner_select ON public.passes FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'passes' AND policyname = 'passes_owner_insert') THEN
    CREATE POLICY passes_owner_insert ON public.passes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'passes' AND policyname = 'passes_owner_update') THEN
    CREATE POLICY passes_owner_update ON public.passes FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'passes' AND policyname = 'passes_owner_delete') THEN
    CREATE POLICY passes_owner_delete ON public.passes FOR DELETE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_usage' AND policyname = 'user_usage_owner_select') THEN
    CREATE POLICY user_usage_owner_select ON public.user_usage FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_usage' AND policyname = 'user_usage_owner_insert') THEN
    CREATE POLICY user_usage_owner_insert ON public.user_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_usage' AND policyname = 'user_usage_owner_update') THEN
    CREATE POLICY user_usage_owner_update ON public.user_usage FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_usage' AND policyname = 'user_usage_owner_delete') THEN
    CREATE POLICY user_usage_owner_delete ON public.user_usage FOR DELETE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'saved_jobs' AND policyname = 'saved_jobs_owner_select') THEN
    CREATE POLICY saved_jobs_owner_select ON public.saved_jobs FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'saved_jobs' AND policyname = 'saved_jobs_owner_insert') THEN
    CREATE POLICY saved_jobs_owner_insert ON public.saved_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'saved_jobs' AND policyname = 'saved_jobs_owner_update') THEN
    CREATE POLICY saved_jobs_owner_update ON public.saved_jobs FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'saved_jobs' AND policyname = 'saved_jobs_owner_delete') THEN
    CREATE POLICY saved_jobs_owner_delete ON public.saved_jobs FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
