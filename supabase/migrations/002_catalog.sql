-- The catalog itself: a region holds sectors, a sector holds routes.
--
-- Ids are uuids that mean nothing and therefore never go stale — a slug key
-- either breaks every link on a rename or starts lying about the name, and
-- two routes may legitimately share one. The human label lives in `name`.
--
-- `name` is Latin everywhere: a catalog written in the language of the crag
-- is a catalog only locals can search. The local spelling lives in
-- `name_local`, stored and searchable, shown beside the Latin name.
--
-- The accepted set is written out as characters rather than escapes, so what
-- the constraint allows is readable: U+0020-U+024F (ASCII, Latin-1, Latin
-- Extended-A and B), U+1E00-U+1EFF (Latin Extended Additional), and the
-- typographic dashes and quotes a name carries. It is kept character-for-
-- character in step with `isLatinName` in `apps/api/src/common/utils/names.ts`.

create table public.regions (
  id uuid primary key default gen_random_uuid(),
  name text not null constraint regions_name_latin check (name ~ '^[ -ɏḀ-ỿ–—‘’]+$'),
  name_local text,
  country text check (country is null or country ~ '^[A-Z]{2}$'),
  rock_type text not null,
  lat double precision,
  lng double precision,
  photo_path text,
  -- Erasing a catalog row for good is never the first click: it is marked
  -- instead, and the mark goes only where the click was. A sector deleted on
  -- its own stays deleted when its region comes back.
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint regions_point_complete check ((lat is null) = (lng is null)),
  constraint regions_lat_range check (lat is null or lat between -90 and 90),
  constraint regions_lng_range check (lng is null or lng between -180 and 180)
);

create table public.sectors (
  id uuid primary key default gen_random_uuid(),
  id_region uuid not null references public.regions (id) on delete cascade,
  name text not null constraint sectors_name_latin check (name ~ '^[ -ɏḀ-ỿ–—‘’]+$'),
  name_local text,
  description text not null default '',
  lat double precision,
  lng double precision,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sectors_point_complete check ((lat is null) = (lng is null)),
  constraint sectors_lat_range check (lat is null or lat between -90 and 90),
  constraint sectors_lng_range check (lng is null or lng between -180 and 180)
);

-- A grade means nothing without the scale it was written in: "7a" is French
-- sport, Fontainebleau bouldering or Saxon depending on the guidebook. The
-- scale travels with the route, and `grade_score` is the sorting key on the
-- scale's own axis — Postgres cannot compute it, the conversion tables live
-- in JavaScript, so the API writes it from sandbag.
--
-- The `_external` numbers are what an import carried over; a tick adds to
-- them rather than replacing them, which routes_with_stats does at read time.
create table public.routes (
  id uuid primary key default gen_random_uuid(),
  id_sector uuid not null references public.sectors (id) on delete cascade,
  name text not null constraint routes_name_latin check (name ~ '^[ -ɏḀ-ỿ–—‘’]+$'),
  name_local text,
  grade text not null,
  grade_scale text not null check (grade_scale in (
    'french', 'yds', 'uiaa', 'saxon', 'ewbank', 'norwegian',
    'brazilian_crux', 'font', 'vscale'
  )),
  grade_score real not null,
  type text not null constraint routes_type_check
    check (type in ('sport', 'boulder')),
  length integer constraint routes_length_check
    check (length is null or length > 0),
  bolts_count integer constraint routes_bolts_count_check
    check (bolts_count is null or bolts_count >= 0),
  description text not null default '',
  rating_external numeric(3, 2) constraint routes_rating_check
    check (rating_external is null
      or (rating_external >= 0 and rating_external <= 5)),
  rating_external_votes integer constraint routes_rating_external_votes_check
    check (rating_external_votes is null or rating_external_votes >= 0),
  ascents_count integer constraint routes_ascents_count_check
    check (ascents_count is null or ascents_count >= 0),
  onsight_count integer constraint routes_onsight_count_check
    check (onsight_count is null or onsight_count >= 0),
  votes_soft integer constraint routes_votes_soft_check
    check (votes_soft is null or votes_soft >= 0),
  votes_neutral integer constraint routes_votes_neutral_check
    check (votes_neutral is null or votes_neutral >= 0),
  votes_hard integer constraint routes_votes_hard_check
    check (votes_hard is null or votes_hard >= 0),
  external_synced_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sectors_id_region_idx on public.sectors (id_region);
create index routes_id_sector_idx on public.routes (id_sector);
create index routes_grade_score_idx on public.routes (grade_score);

-- The list pages read the live catalog only, so the partial indexes carry the
-- `deleted_at is null` filter rather than leaving it to a filter step.
create index regions_alive_idx on public.regions (name) where deleted_at is null;
create index sectors_alive_id_region_idx on public.sectors (id_region)
  where deleted_at is null;
create index routes_alive_id_sector_idx on public.routes (id_sector)
  where deleted_at is null;

-- Both spellings of every name are searched with an unanchored LIKE, which
-- trigram indexes keep off a sequential scan.
create index regions_name_trgm_idx on public.regions using gin (name gin_trgm_ops);
create index regions_name_local_trgm_idx
  on public.regions using gin (name_local gin_trgm_ops);
create index sectors_name_trgm_idx on public.sectors using gin (name gin_trgm_ops);
create index sectors_name_local_trgm_idx
  on public.sectors using gin (name_local gin_trgm_ops);
create index routes_name_trgm_idx on public.routes using gin (name gin_trgm_ops);
create index routes_name_local_trgm_idx
  on public.routes using gin (name_local gin_trgm_ops);

create trigger regions_set_updated_at
  before update on public.regions
  for each row execute function public.set_updated_at();

create trigger sectors_set_updated_at
  before update on public.sectors
  for each row execute function public.set_updated_at();

create trigger routes_set_updated_at
  before update on public.routes
  for each row execute function public.set_updated_at();

alter table public.regions enable row level security;
alter table public.sectors enable row level security;
alter table public.routes enable row level security;

create policy regions_select_public on public.regions for select using (true);
create policy sectors_select_public on public.sectors for select using (true);
create policy routes_select_public on public.routes for select using (true);

create policy regions_write_admin on public.regions
  for all using (public.is_admin()) with check (public.is_admin());
create policy sectors_write_admin on public.sectors
  for all using (public.is_admin()) with check (public.is_admin());
create policy routes_write_admin on public.routes
  for all using (public.is_admin()) with check (public.is_admin());
