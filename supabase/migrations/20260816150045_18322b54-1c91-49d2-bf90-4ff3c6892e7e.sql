CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE TABLE public.job_secrets (
  name text PRIMARY KEY,
  value uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.job_secrets TO service_role;
ALTER TABLE public.job_secrets ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: only trusted server code may read this.

INSERT INTO public.job_secrets (name) VALUES ('email_daily');

SELECT cron.schedule(
  'plainly-daily-emails',
  '0 13 * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--cafdc049-7937-48cf-859a-bec60d15a5ba.lovable.app/api/public/emails/daily',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT value::text FROM public.job_secrets WHERE name = 'email_daily')
    ),
    body := '{}'::jsonb
  );
  $$
);