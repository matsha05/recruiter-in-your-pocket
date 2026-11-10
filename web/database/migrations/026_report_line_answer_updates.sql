-- Save or clear one card in the current row, atomically. The previous application-side
-- read/merge/write could discard another card's answers when two saves overlapped.
-- Apply before deploying the route that calls this RPC; existing rows need no rewrite.
CREATE OR REPLACE FUNCTION public.update_report_line_answers(
  p_report_id UUID,
  p_user_id UUID,
  p_fix_index INTEGER,
  p_answers JSONB,
  p_line TEXT,
  p_source TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_answers JSONB;
  v_clear BOOLEAN;
BEGIN
  -- Only the route's service client can execute this function. Keep the same bounds at
  -- this boundary as a defense against a future caller bypassing the request parser.
  IF p_report_id IS NULL OR p_user_id IS NULL
    OR p_fix_index IS NULL OR p_fix_index < 0 OR p_fix_index >= 12
    OR jsonb_typeof(p_answers) IS DISTINCT FROM 'array'
    OR p_source IS NULL OR p_source NOT IN ('literal', 'polished', 'edited')
    OR (p_line IS NOT NULL AND (length(btrim(p_line)) = 0 OR length(p_line) > 600))
  THEN
    RAISE EXCEPTION 'invalid_line_answers' USING ERRCODE = '22023';
  END IF;
  IF jsonb_array_length(p_answers) > 6 THEN
    RAISE EXCEPTION 'invalid_line_answers' USING ERRCODE = '22023';
  END IF;
  v_clear := jsonb_array_length(p_answers) = 0;
  IF v_clear AND (p_line IS NOT NULL OR p_source <> 'literal') THEN
    RAISE EXCEPTION 'invalid_line_answers' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_answers) AS item(answer)
    WHERE jsonb_typeof(answer) IS DISTINCT FROM 'object'
      OR jsonb_typeof(answer->'question') IS DISTINCT FROM 'string'
      OR length(btrim(answer->>'question')) = 0
      OR length(answer->>'question') > 300
      OR answer->>'kind' IS NULL
      OR answer->>'kind' NOT IN ('answered', 'unknown', 'not_mine')
      OR (answer->>'kind' = 'answered' AND (
        jsonb_typeof(answer->'text') IS DISTINCT FROM 'string'
        OR length(btrim(answer->>'text')) = 0
        OR length(answer->>'text') > 300
      ))
  ) THEN
    RAISE EXCEPTION 'invalid_line_answers' USING ERRCODE = '22023';
  END IF;

  -- UPDATE locks the row and evaluates this expression against its current value.
  -- Each caller supplies one card, never a copy of the other cards it previously read.
  UPDATE public.reports AS report
  SET line_answers = CASE WHEN v_clear THEN
    (CASE WHEN jsonb_typeof(report.line_answers) = 'object' THEN report.line_answers ELSE '{}'::jsonb END) - p_fix_index::text
  ELSE
    (CASE WHEN jsonb_typeof(report.line_answers) = 'object' THEN report.line_answers ELSE '{}'::jsonb END)
      || jsonb_build_object(p_fix_index::text, jsonb_build_object(
        'answers', p_answers,
        'line', p_line,
        'source', p_source,
        'updated_at', clock_timestamp()
      ))
  END
  WHERE report.id = p_report_id AND report.user_id = p_user_id
  RETURNING report.line_answers INTO v_answers;

  -- SQL NULL means no matching owner/row; an empty object means the clear succeeded.
  RETURN v_answers;
END;
$$;

REVOKE ALL ON FUNCTION public.update_report_line_answers(UUID, UUID, INTEGER, JSONB, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_report_line_answers(UUID, UUID, INTEGER, JSONB, TEXT, TEXT)
  TO service_role;
