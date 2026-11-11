-- Which saved report a report revises (Nov 11, 2026), so My reports can keep the versions of one resume together
-- and measure a version's score against the version before it.
--
-- Set once, by the server, when a signed-in person runs a report from "Check a revision" on a saved report or
-- writes a report again from their answers. Null for a first report and for every report made before this.
-- Deleting the earlier report clears the link and keeps the later one. Forward-only; nothing else changes.
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS revises_report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL;

ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_revises_not_self;
ALTER TABLE public.reports
  ADD CONSTRAINT reports_revises_not_self CHECK (revises_report_id IS NULL OR revises_report_id <> id);

CREATE INDEX IF NOT EXISTS reports_revises_report_id_idx
  ON public.reports(revises_report_id) WHERE revises_report_id IS NOT NULL;

COMMENT ON COLUMN public.reports.revises_report_id IS
  'The saved report this one is a revision of, when it was run as a re-check or a rewrite of that report.';
