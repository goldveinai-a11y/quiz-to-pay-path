-- Email preferences
CREATE TABLE public.email_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  daily_reminder boolean NOT NULL DEFAULT true,
  win_back boolean NOT NULL DEFAULT true,
  milestone boolean NOT NULL DEFAULT true,
  unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX email_preferences_token_idx ON public.email_preferences (unsubscribe_token);
GRANT SELECT, UPDATE ON public.email_preferences TO authenticated;
GRANT ALL ON public.email_preferences TO service_role;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own email preferences read" ON public.email_preferences
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own email preferences update" ON public.email_preferences
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Email log
CREATE TABLE public.email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  day_number integer,
  sent_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX email_events_user_kind_idx ON public.email_events (user_id, kind, day_number);
GRANT SELECT ON public.email_events TO authenticated;
GRANT ALL ON public.email_events TO service_role;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own email events" ON public.email_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Word study dictionary
CREATE TABLE public.word_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book text NOT NULL,
  chapter integer NOT NULL,
  verse integer NOT NULL,
  word text NOT NULL,
  original text NOT NULL,
  transliteration text NOT NULL,
  language text NOT NULL DEFAULT 'Greek',
  meaning text NOT NULL,
  also_in text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX word_notes_unique_idx ON public.word_notes (book, chapter, verse, lower(word));
CREATE INDEX word_notes_passage_idx ON public.word_notes (book, chapter, verse);
GRANT SELECT ON public.word_notes TO anon, authenticated;
GRANT ALL ON public.word_notes TO service_role;
ALTER TABLE public.word_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "word notes are public" ON public.word_notes
  FOR SELECT TO anon, authenticated USING (true);

-- Streak on the plan
ALTER TABLE public.user_plans
  ADD COLUMN streak_count integer NOT NULL DEFAULT 0,
  ADD COLUMN longest_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN last_completed_on date,
  ADD COLUMN freezes_used integer NOT NULL DEFAULT 0,
  ADD COLUMN paused_until timestamptz,
  ADD COLUMN completed_at timestamptz,
  ADD COLUMN review_asked_at timestamptz;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER email_preferences_touch BEFORE UPDATE ON public.email_preferences
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();