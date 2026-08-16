
CREATE TABLE public.verses (
  id BIGSERIAL PRIMARY KEY,
  translation TEXT NOT NULL DEFAULT 'WEB',
  book TEXT NOT NULL,
  chapter INT NOT NULL,
  verse INT NOT NULL,
  text TEXT NOT NULL,
  UNIQUE (translation, book, chapter, verse)
);
GRANT SELECT ON public.verses TO anon, authenticated;
GRANT ALL ON public.verses TO service_role;
ALTER TABLE public.verses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "verses are public" ON public.verses FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  tone TEXT NOT NULL DEFAULT 'teal',
  artist TEXT,
  year TEXT,
  source TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.artworks TO anon, authenticated;
GRANT ALL ON public.artworks TO service_role;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "artworks are public" ON public.artworks FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_slug TEXT NOT NULL,
  day_number INT NOT NULL,
  title TEXT NOT NULL,
  setup TEXT NOT NULL,
  reference TEXT NOT NULL,
  book TEXT NOT NULL,
  chapter INT NOT NULL,
  verse_start INT NOT NULL,
  verse_end INT NOT NULL,
  highlight_word TEXT,
  insight_title TEXT NOT NULL,
  insight_body TEXT NOT NULL,
  insight_author TEXT NOT NULL,
  insight_year TEXT NOT NULL,
  context_body TEXT NOT NULL,
  divides BOOLEAN NOT NULL DEFAULT false,
  divide_question TEXT,
  divide_readings JSONB,
  divide_common TEXT,
  question TEXT NOT NULL,
  art_tone TEXT NOT NULL DEFAULT 'teal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (book_slug, day_number)
);
GRANT SELECT ON public.study_sessions TO anon, authenticated;
GRANT ALL ON public.study_sessions TO service_role;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions are readable" ON public.study_sessions FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  book_slug TEXT NOT NULL DEFAULT 'john',
  book_title TEXT NOT NULL DEFAULT 'John in 30 days',
  translation TEXT NOT NULL DEFAULT 'WEB',
  tradition TEXT NOT NULL DEFAULT 'unsure',
  voices TEXT NOT NULL DEFAULT 'Matthew Henry, John Gill, Albert Barnes',
  show_both_sides BOOLEAN NOT NULL DEFAULT false,
  reader_name TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX user_plans_user_idx ON public.user_plans (user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_plans TO authenticated;
GRANT ALL ON public.user_plans TO service_role;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own plans" ON public.user_plans FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.user_plans ON DELETE CASCADE,
  day_number INT NOT NULL,
  step INT NOT NULL DEFAULT 1,
  completed_at TIMESTAMPTZ,
  note TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (plan_id, day_number)
);
CREATE INDEX user_progress_user_idx ON public.user_progress (user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_progress TO authenticated;
GRANT ALL ON public.user_progress TO service_role;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progress" ON public.user_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  plan_code TEXT NOT NULL DEFAULT '1-month',
  plan_label TEXT NOT NULL DEFAULT '1-month access',
  amount_cents INT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'active',
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX subscriptions_user_idx ON public.subscriptions (user_id);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subscription" ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
