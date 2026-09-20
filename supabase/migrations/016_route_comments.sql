-- Beta, conditions and warnings, written by climbers on a route. Public to
-- read; an author owns their own comment and nobody else's.

create table public.route_comments (
  id uuid primary key default gen_random_uuid(),
  id_route uuid not null references public.routes (id) on delete cascade,
  -- Points at public.users, not at auth.users: the name and avatar then come
  -- back with the row in a single query.
  id_user uuid not null references public.users (id) on delete cascade,
  body text not null check (length(btrim(body)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index route_comments_id_route_idx
  on public.route_comments (id_route, created_at desc);

create trigger route_comments_set_updated_at
  before update on public.route_comments
  for each row execute function public.set_updated_at();

alter table public.route_comments enable row level security;

create policy route_comments_select_public on public.route_comments
  for select using (true);

create policy route_comments_write_own on public.route_comments
  for all using (auth.uid() = id_user) with check (auth.uid() = id_user);

create policy route_comments_moderate_admin on public.route_comments
  for delete using (public.is_admin());
