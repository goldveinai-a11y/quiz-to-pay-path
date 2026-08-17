REVOKE INSERT, DELETE ON public.email_preferences FROM authenticated;
REVOKE ALL ON public.email_preferences FROM anon;
GRANT SELECT, UPDATE ON public.email_preferences TO authenticated;
GRANT ALL ON public.email_preferences TO service_role;