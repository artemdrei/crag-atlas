-- Slugs made poor primary keys: a rename either broke every link and tick or
-- left the id lying about the name, and two routes may legitimately share a
-- name. Ids become uuids that mean nothing and therefore never go stale; the
-- human label lives in `name` and is shown in breadcrumbs, not in the key.
--
-- The catalog is rebuilt rather than migrated in place: at this point it holds
-- a handful of rows and no tick references them.

alter table public.ticks drop constraint ticks_id_route_fkey;

drop table public.routes;
drop table public.sectors;
drop table public.regions;

create table public.regions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  province text not null,
  rock_type text not null,
  grade_range text not null,
  sector_count integer not null default 0,
  route_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sectors (
  id uuid primary key default gen_random_uuid(),
  id_region uuid not null references public.regions (id) on delete cascade,
  name text not null,
  description text not null default '',
  grade_range text not null,
  approach_minutes integer check (approach_minutes is null or approach_minutes >= 0),
  route_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.routes (
  id uuid primary key default gen_random_uuid(),
  id_sector uuid not null references public.sectors (id) on delete cascade,
  name text not null,
  grade text not null,
  type text not null check (type in ('sport', 'trad', 'boulder')),
  length integer check (length is null or length > 0),
  bolts_count integer check (bolts_count is null or bolts_count >= 0),
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sectors_id_region_idx on public.sectors (id_region);
create index routes_id_sector_idx on public.routes (id_sector);

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

-- The table is empty at this point, so the cast has nothing to convert.
alter table public.ticks alter column id_route type uuid using id_route::uuid;

alter table public.ticks
  add constraint ticks_id_route_fkey
  foreign key (id_route) references public.routes (id) on delete restrict;
