CREATE TABLE IF NOT EXISTS public.email_job_runs (
  id uuid primary key default gen_random_uuid(),
  ran_at timestamptz not null default now(),
  ok boolean not null default true,
  daily integer not null default 0,
  win_back integer not null default 0,
  finish integer not null default 0,
  skipped integer not null default 0,
  reasons jsonb,
  error text
);
GRANT ALL ON public.email_job_runs TO service_role;
ALTER TABLE public.email_job_runs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
UPDATE public.subscriptions SET is_test = true WHERE provider_subscription_id IS NULL;

SELECT cron.unschedule('plainly-daily-emails');
SELECT cron.schedule(
  'bibleroutine-daily-emails',
  '0 13 * * *',
  $job$
  SELECT net.http_post(
    url := 'https://project--cafdc049-7937-48cf-859a-bec60d15a5ba.lovable.app/api/public/emails/daily',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT value::text FROM public.job_secrets WHERE name = 'email_daily')
    ),
    body := '{}'::jsonb
  );
  $job$
);