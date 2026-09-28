-- What climbers leave on a route — the beta they wrote, the photos and videos
-- they attached — and the topo drawings an admin maintains.
--
-- All three hold the route back with `on delete restrict`: erasing a catalog
-- row for good cannot destroy a climber's work. The rule belongs in the schema
-- rather than in the one service method that erases, so no future code path
-- can get it wrong.

create table public.route_comments (
  id uuid primary key default gen_random_uuid(),
  id_route uuid not null references public.routes (id) on delete restrict,
  id_user uuid not null references public.users (id) on delete cascade,
  body text not null check (length(btrim(body)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A row carries a url or a storage path, never both: a linked video and an
-- uploaded photo are the same kind of thing to the page that renders them.
create table public.route_media (
  id uuid primary key default gen_random_uuid(),
  id_route uuid not null references public.routes (id) on delete restrict,
  id_user uuid not null references public.users (id) on delete cascade,
  id_tick uuid references public.ticks (id) on delete cascade,
  kind text not null check (kind in ('video', 'photo')),
  url text,
  storage_path text,
  title text not null default '',
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint route_media_url_or_path check (num_nonnulls(url, storage_path) = 1)
);

-- A sector is photographed in parts ("left side", "right side"), and each
-- route is a line drawn on one of those photos. Hence two tables: the photo
-- belongs to the sector, the line belongs to a route on a given photo. A
-- photo is named by its position, not by a label somebody has to type.
create table public.topos (
  id uuid primary key default gen_random_uuid(),
  id_sector uuid not null references public.sectors (id) on delete cascade,
  storage_path text not null,
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keyed by the route alone: one line per route, moved between photos instead
-- of copied onto each.
create table public.route_lines (
  id_route uuid primary key references public.routes (id) on delete cascade,
  id_topo uuid not null references public.topos (id) on delete cascade,
  -- [[x, y], …] with both coordinates 0..1 fractions of the photo, so one
  -- geometry renders at any size without knowing the original resolution.
  points jsonb not null,
  bolts jsonb not null default '[]'::jsonb,
  anchor jsonb,
  label_offset_x double precision not null default 0
    check (label_offset_x >= -1 and label_offset_x <= 1),
  label_offset_y double precision not null default 0
    check (label_offset_y >= -1 and label_offset_y <= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index route_comments_id_route_idx
  on public.route_comments (id_route, created_at desc);
create index route_media_id_route_idx
  on public.route_media (id_route, created_at desc);
create index route_media_id_route_kind_idx on public.route_media (id_route, kind);
create index route_media_id_tick_idx on public.route_media (id_tick);
create index topos_id_sector_idx on public.topos (id_sector, sort_order);
create index route_lines_id_topo_idx on public.route_lines (id_topo);

create trigger route_comments_set_updated_at
  before update on public.route_comments
  for each row execute function public.set_updated_at();

create trigger route_media_set_updated_at
  before update on public.route_media
  for each row execute function public.set_updated_at();

create trigger topos_set_updated_at
  before update on public.topos
  for each row execute function public.set_updated_at();

create trigger route_lines_set_updated_at
  before update on public.route_lines
  for each row execute function public.set_updated_at();

alter table public.route_comments enable row level security;
alter table public.route_media enable row level security;
alter table public.topos enable row level security;
alter table public.route_lines enable row level security;

create policy route_comments_select_public on public.route_comments
  for select using (true);
create policy route_media_select_public on public.route_media
  for select using (true);
create policy topos_select_public on public.topos for select using (true);
create policy route_lines_select_public on public.route_lines
  for select using (true);

create policy route_comments_write_own on public.route_comments
  for all using (auth.uid() = id_user) with check (auth.uid() = id_user);
create policy route_media_write_own on public.route_media
  for all using (auth.uid() = id_user) with check (auth.uid() = id_user);

-- An admin may take somebody else's comment or media down, and nothing more:
-- moderation is a delete, never an edit of what a climber wrote.
create policy route_comments_moderate_admin on public.route_comments
  for delete using (public.is_admin());
create policy route_media_moderate_admin on public.route_media
  for delete using (public.is_admin());

create policy topos_write_admin on public.topos
  for all using (public.is_admin()) with check (public.is_admin());
create policy route_lines_write_admin on public.route_lines
  for all using (public.is_admin()) with check (public.is_admin());
