-- One card's answers merged into a saved report in a single statement (Nov 17, 2026).
--
-- PATCH /api/reports/:id/answers read line_answers, merged one card in, and wrote the whole object back. Two
-- saves in flight together, for two cards, each wrote its own copy, and the later one erased the earlier card's
-- answers (seen on the live walk of November 17). This sets the one key inside the UPDATE, so the row lock
-- orders concurrent saves and each keeps the others' cards.
--
-- Only the service role calls it, after the route has checked the reader owns the report. A non-object value
-- (nothing written yet) starts from an empty object. It returns the stored answers, or null when no report of
-- that owner matched. Forward-only; nothing else changes.
CREATE OR REPLACE FUNCTION public.set_report_line_answer(
  p_report_id UUID,
  p_user_id UUID,
  p_fix_index TEXT,
  p_entry JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  merged JSONB;
BEGIN
  UPDATE public.reports
  SET line_answers =
    (CASE WHEN jsonb_typeof(line_answers) = 'object' THEN line_answers ELSE '{}'::jsonb END)
    || jsonb_build_object(p_fix_index, p_entry)
  WHERE id = p_report_id
    AND user_id = p_user_id
  RETURNING line_answers INTO merged;
  RETURN merged;
END;
$$;

-- The function runs as its caller. The service role already writes this table in production; the grant states
-- the columns it needs, so a fresh database replays the same way.
GRANT SELECT (id, user_id, line_answers), UPDATE (line_answers) ON TABLE public.reports TO service_role;

REVOKE ALL ON FUNCTION public.set_report_line_answer(UUID, UUID, TEXT, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_report_line_answer(UUID, UUID, TEXT, JSONB)
  TO service_role;

COMMENT ON FUNCTION public.set_report_line_answer(UUID, UUID, TEXT, JSONB) IS
  'Sets one card''s entry in reports.line_answers in a single UPDATE, so concurrent saves for different cards keep each other.';
