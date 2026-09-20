-- Videos and photos a climber attaches to a route. The file itself lives
-- wherever it already is — a link is enough until uploads exist.

create table public.route_media (
  id uuid primary key default gen_random_uuid(),
  id_route uuid not null references public.routes (id) on delete cascade,
  -- Points at public.users, not at auth.users: the name and avatar then come
  -- back with the row in a single query.
  id_user uuid not null references public.users (id) on delete cascade,
  kind text not null check (kind in ('video', 'photo')),
  url text not null,
  title text not null default '',
  duration_seconds integer
    check (duration_seconds is null or duration_seconds > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index route_media_id_route_idx
  on public.route_media (id_route, created_at desc);

create trigger route_media_set_updated_at
  before update on public.route_media
  for each row execute function public.set_updated_at();

alter table public.route_media enable row level security;

create policy route_media_select_public on public.route_media
  for select using (true);

create policy route_media_write_own on public.route_media
  for all using (auth.uid() = id_user) with check (auth.uid() = id_user);

create policy route_media_moderate_admin on public.route_media
  for delete using (public.is_admin());
