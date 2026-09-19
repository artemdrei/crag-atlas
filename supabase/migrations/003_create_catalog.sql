-- The route catalog: regions → sectors → routes. Until now it lived as static
-- JSON inside apps/api; ids stay the human-readable slugs used there and in
-- every URL, so links and logged ticks keep working.

create table public.regions (
  id text primary key,
  name text not null,
  province text not null,
  rock_type text not null,
  grade_range text not null,
  -- Denormalized counters: cheap to read, and the admin editor owns keeping
  -- them honest once it exists.
  sector_count integer not null default 0,
  route_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sectors (
  id text primary key,
  id_region text not null references public.regions (id) on delete cascade,
  name text not null,
  description text not null default '',
  grade_range text not null,
  approach_minutes integer check (approach_minutes is null or approach_minutes >= 0),
  route_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.routes (
  id text primary key,
  id_sector text not null references public.sectors (id) on delete cascade,
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

-- The catalog is public reading and, for now, nobody's writing: an
-- RLS-enabled table with no insert/update/delete policy rejects every write
-- that does not come from the service role. Write policies arrive with the
-- admin editor, together with the roles it needs.
create policy regions_select_public on public.regions for select using (true);
create policy sectors_select_public on public.sectors for select using (true);
create policy routes_select_public on public.routes for select using (true);
