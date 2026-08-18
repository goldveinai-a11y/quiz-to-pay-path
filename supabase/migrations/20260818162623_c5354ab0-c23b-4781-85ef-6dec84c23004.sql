ALTER TABLE public.study_sessions
  ADD COLUMN IF NOT EXISTS word_study jsonb,
  ADD COLUMN IF NOT EXISTS cross_reference jsonb,
  ADD COLUMN IF NOT EXISTS application jsonb,
  ADD COLUMN IF NOT EXISTS voices jsonb;