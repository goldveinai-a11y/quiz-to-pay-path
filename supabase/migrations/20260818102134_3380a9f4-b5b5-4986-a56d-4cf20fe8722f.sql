insert into public.email_preferences (user_id, email)
select distinct p.user_id, u.email
from public.user_plans p
join auth.users u on u.id = p.user_id
where u.email is not null
  and not exists (select 1 from public.email_preferences e where e.user_id = p.user_id);

create table public.session_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_slug text not null,
  day_number integer not null,
  question text not null,
  answer text not null,
  created_at timestamp with time zone not null default now()
);

grant select, insert on public.session_questions to authenticated;
grant all on public.session_questions to service_role;

alter table public.session_questions enable row level security;

create policy "own questions read" on public.session_questions
  for select to authenticated using (auth.uid() = user_id);
create policy "own questions insert" on public.session_questions
  for insert to authenticated with check (auth.uid() = user_id);

create index session_questions_user_day_idx on public.session_questions (user_id, created_at desc);