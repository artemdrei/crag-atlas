-- A sector is photographed in parts ("left side", "right side"), and each route
-- is a line drawn on one of those photos. Hence two tables: the photo belongs
-- to the sector, the line belongs to a route *on a given photo*.

create table public.topos (
  id uuid primary key default gen_random_uuid(),
  id_sector uuid not null references public.sectors (id) on delete cascade,
  storage_path text not null,
  label text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.route_lines (
  id_route uuid not null references public.routes (id) on delete cascade,
  id_topo uuid not null references public.topos (id) on delete cascade,
  -- [[x, y], …] with both coordinates 0..1 fractions of the photo, so one
  -- geometry renders at any size without knowing the original resolution.
  points jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id_route, id_topo)
);

create index topos_id_sector_idx on public.topos (id_sector, sort_order);
create index route_lines_id_topo_idx on public.route_lines (id_topo);

create trigger topos_set_updated_at
  before update on public.topos
  for each row execute function public.set_updated_at();

create trigger route_lines_set_updated_at
  before update on public.route_lines
  for each row execute function public.set_updated_at();

alter table public.topos enable row level security;
alter table public.route_lines enable row level security;

create policy topos_select_public on public.topos for select using (true);
create policy route_lines_select_public on public.route_lines
  for select using (true);

create policy topos_write_admin on public.topos
  for all using (public.is_admin()) with check (public.is_admin());

create policy route_lines_write_admin on public.route_lines
  for all using (public.is_admin()) with check (public.is_admin());

-- Public bucket: the images are what the page renders, and a signed URL per
-- image would only add expiry handling to a catalogue everyone may read.
insert into storage.buckets (id, name, public)
values ('topos', 'topos', true)
on conflict (id) do nothing;

create policy "topos_read_public" on storage.objects
  for select using (bucket_id = 'topos');

create policy "topos_write_admin" on storage.objects
  for all using (bucket_id = 'topos' and public.is_admin())
  with check (bucket_id = 'topos' and public.is_admin());
