-- Consume each anonymous report-save receipt atomically with the report insert.
-- The application stores only a SHA-256 digest of the signed bearer receipt.
-- A global unique index makes retries idempotent for the first owner and blocks
-- both same-account duplication and cross-account replay without process state.

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS anonymous_receipt_hash VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS reports_anonymous_receipt_hash_idx
  ON public.reports (anonymous_receipt_hash)
  WHERE anonymous_receipt_hash IS NOT NULL;

COMMENT ON COLUMN public.reports.anonymous_receipt_hash IS
  'SHA-256 digest of a consumed anonymous report-save receipt; globally single-use.';
