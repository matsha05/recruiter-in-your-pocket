-- The answers a signed-in reader types under a Critical Miss, and the revised line they chose, kept
-- with the saved report so the line survives a reload and prints in the PDF (W3, Nov 2026).
--
-- One JSON object per report, keyed by the fix's position ("0", "1", "2"):
--   { "0": { "answers": [{ "question": "...", "kind": "answered", "text": "..." }], "line": "...",
--            "source": "literal" | "polished" | "edited", "updated_at": "..." } }
-- It never holds the resume. Only the service role writes it (PATCH /api/reports/:id/answers checks the
-- owner first); readers get it through the owner-only select policy with the rest of the report, and it
-- goes with the row when the report or the account is deleted. Forward-only; nothing else changes.
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS line_answers JSONB;

COMMENT ON COLUMN public.reports.line_answers IS
  'Reader answers under each Critical Miss and the revised line they chose, keyed by fix position. Never the resume.';
