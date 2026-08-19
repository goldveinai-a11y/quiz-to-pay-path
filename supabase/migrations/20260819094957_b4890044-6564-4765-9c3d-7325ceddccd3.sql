-- email_preferences: explicit owner-scoped insert/delete
CREATE POLICY "own email preferences insert" ON public.email_preferences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own email preferences delete" ON public.email_preferences
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
GRANT INSERT, DELETE ON public.email_preferences TO authenticated;

-- session_questions: owner-scoped update/delete
CREATE POLICY "own questions update" ON public.session_questions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own questions delete" ON public.session_questions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
GRANT UPDATE, DELETE ON public.session_questions TO authenticated;