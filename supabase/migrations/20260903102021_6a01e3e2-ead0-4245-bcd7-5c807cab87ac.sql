create table public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  segment text,
  newsletter boolean not null default false,
  created_at timestamptz not null default now()
);

grant all on public.leads to service_role;

alter table public.leads enable row level security;

-- No anon/authenticated policies: leads are written and read only via service role (server functions).