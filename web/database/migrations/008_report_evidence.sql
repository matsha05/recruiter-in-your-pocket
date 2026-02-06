-- Evidence traceability fields for report claims.
-- Supports evidence-to-action ledger UX and confidence signaling.

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS evidence_json JSONB;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS evidence_version TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS evidence_summary TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS confidence_band TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'reports_confidence_band_check'
      AND conrelid = 'public.reports'::regclass
  ) THEN
    ALTER TABLE public.reports
      ADD CONSTRAINT reports_confidence_band_check
      CHECK (confidence_band IS NULL OR confidence_band IN ('low', 'medium', 'high'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS reports_evidence_version_idx ON public.reports (evidence_version);
CREATE INDEX IF NOT EXISTS reports_confidence_band_idx ON public.reports (confidence_band);
CREATE INDEX IF NOT EXISTS reports_evidence_json_gin_idx ON public.reports USING GIN (evidence_json);
