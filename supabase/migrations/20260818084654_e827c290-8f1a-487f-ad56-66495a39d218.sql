DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.id AS dup_id, c.id AS keep_id
    FROM public.user_plans p
    JOIN (
      SELECT DISTINCT ON (user_id, book_slug) id, user_id, book_slug
      FROM public.user_plans
      ORDER BY user_id, book_slug, created_at ASC
    ) c ON c.user_id = p.user_id AND c.book_slug = p.book_slug
    WHERE p.id <> c.id
  LOOP
    -- fold clashing days into the canonical row, keeping the better values
    UPDATE public.user_progress k
    SET step = GREATEST(k.step, up.step),
        completed_at = COALESCE(k.completed_at, up.completed_at),
        note = COALESCE(NULLIF(TRIM(COALESCE(k.note, '')), ''), up.note),
        updated_at = now()
    FROM public.user_progress up
    WHERE up.plan_id = r.dup_id
      AND k.plan_id = r.keep_id
      AND k.day_number = up.day_number;

    DELETE FROM public.user_progress up
    WHERE up.plan_id = r.dup_id
      AND EXISTS (
        SELECT 1 FROM public.user_progress k
        WHERE k.plan_id = r.keep_id AND k.day_number = up.day_number
      );

    UPDATE public.user_progress
    SET plan_id = r.keep_id
    WHERE plan_id = r.dup_id;

    DELETE FROM public.user_plans WHERE id = r.dup_id;
  END LOOP;
END $$;

ALTER TABLE public.user_plans
  ADD CONSTRAINT user_plans_user_book_key UNIQUE (user_id, book_slug);

CREATE TABLE public.reader_state (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_count integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_completed_on date,
  freezes_used integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.reader_state TO authenticated;
GRANT ALL ON public.reader_state TO service_role;

ALTER TABLE public.reader_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own reader state read" ON public.reader_state
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own reader state insert" ON public.reader_state
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own reader state update" ON public.reader_state
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER reader_state_touch
  BEFORE UPDATE ON public.reader_state
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.reader_state (user_id, streak_count, longest_streak, last_completed_on, freezes_used)
SELECT user_id,
       MAX(streak_count),
       MAX(longest_streak),
       MAX(last_completed_on),
       MAX(freezes_used)
FROM public.user_plans
GROUP BY user_id
ON CONFLICT (user_id) DO NOTHING;