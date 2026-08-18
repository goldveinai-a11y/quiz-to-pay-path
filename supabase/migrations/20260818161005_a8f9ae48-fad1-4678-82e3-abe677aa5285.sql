CREATE TABLE public.session_quiz (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_slug text NOT NULL,
  day_number integer NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_index integer NOT NULL,
  explanation text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (book_slug, day_number)
);
GRANT SELECT ON public.session_quiz TO anon;
GRANT SELECT ON public.session_quiz TO authenticated;
GRANT ALL ON public.session_quiz TO service_role;
ALTER TABLE public.session_quiz ENABLE ROW LEVEL SECURITY;
CREATE POLICY "session quiz is readable" ON public.session_quiz FOR SELECT TO anon, authenticated USING (true);