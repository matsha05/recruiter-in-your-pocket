-- "Was this the right thing to fix first?" on the Critical Miss (plan item 2.6).
-- Answers feed the report eval set. The row keeps the model's Critical Miss
-- wording and the reader's answer, never the resume or its quoted line.
-- Only the service role writes or reads it; account deletion removes a
-- signed-in reader's rows with the account.
CREATE TABLE IF NOT EXISTS public.report_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE,
  report_id uuid REFERENCES public.reports (id) ON DELETE SET NULL,
  critical_miss text NOT NULL CHECK (char_length(critical_miss) BETWEEN 1 AND 600),
  nothing_critical boolean NOT NULL DEFAULT false,
  answer text NOT NULL CHECK (answer IN ('right', 'wrong')),
  note text CHECK (note IS NULL OR char_length(note) <= 600)
);

CREATE INDEX IF NOT EXISTS report_feedback_created_at_idx ON public.report_feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS report_feedback_user_id_idx ON public.report_feedback (user_id) WHERE user_id IS NOT NULL;

ALTER TABLE public.report_feedback ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.report_feedback FROM anon, authenticated;
