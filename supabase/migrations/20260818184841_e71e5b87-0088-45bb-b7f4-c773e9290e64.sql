CREATE TABLE public.verse_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_slug text NOT NULL,
  day_number integer NOT NULL,
  reference text NOT NULL,
  verse integer NOT NULL,
  text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_slug, day_number, verse)
);

GRANT SELECT, INSERT, DELETE ON public.verse_highlights TO authenticated;
GRANT ALL ON public.verse_highlights TO service_role;

ALTER TABLE public.verse_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own highlights read" ON public.verse_highlights
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own highlights insert" ON public.verse_highlights
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own highlights delete" ON public.verse_highlights
  FOR DELETE TO authenticated USING (auth.uid() = user_id);