-- What a sector needs before anyone can say whether the sun reaches it, and
-- whether the rain does.
--
-- `aspect_deg` is the compass direction the wall faces, 0 = north, clockwise.
-- A digital elevation model cannot see a forty metre cliff — at thirty to
-- ninety metres per cell the whole crag is sub-pixel — so terrain alone would
-- report a north face as sunlit all day. The aspect is what turns the sun
-- away from the back of the wall. Null means nobody has set it and no profile
-- has been computed yet; the value a profile derives from the surrounding
-- slope lives on `sector_horizon`, and this column overrides it.
alter table public.sectors add column aspect_deg smallint
  constraint sectors_aspect_range
    check (aspect_deg is null or aspect_deg between 0 and 359);

-- Rain does not reach every sector. A cave or a deep roof stays climbable in
-- weather that shuts an open crag, which is the whole reason the conditions
-- score cannot read the forecast alone.
alter table public.sectors add column shelter text not null default 'open'
  constraint sectors_shelter_check
    check (shelter in ('open', 'partial', 'full'));

-- The skyline around a sector, as the maximum angle the terrain rises to in
-- each compass direction: 360 entries, one per degree, in tenths of a degree.
--
-- Deliberately not the elevation model it was built from. The model is tens
-- of thousands of samples per sector and answers one question we ever ask —
-- "is the sun above the ridge in that direction" — so only the answer is
-- kept.
--
-- A row with `computed_at` null is a sector queued for computation: building
-- a profile costs dozens of calls to the elevation provider, far too many to
-- run inside the request that moved the sector's pin.
create table public.sector_horizon (
  id_sector uuid primary key
    references public.sectors (id) on delete cascade,
  profile smallint[]
    constraint sector_horizon_profile_size
      check (profile is null or array_length(profile, 1) = 360),
  -- Ground height at the sector itself, the baseline every horizon angle is
  -- measured from.
  elevation_m real,
  -- Where the slope around the sector falls away, which is the direction a
  -- wall built into it faces. `sectors.aspect_deg` wins when an admin has
  -- written one.
  aspect_deg smallint
    constraint sector_horizon_aspect_range
      check (aspect_deg is null or aspect_deg between 0 and 359),
  source text,
  computed_at timestamptz,
  -- When the provider refused, so a failing sector is retried without
  -- blocking the ones behind it in the queue.
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sector_horizon_pending_idx on public.sector_horizon (created_at)
  where computed_at is null;

create trigger sector_horizon_set_updated_at
  before update on public.sector_horizon
  for each row execute function public.set_updated_at();

alter table public.sector_horizon enable row level security;

create policy sector_horizon_select_public on public.sector_horizon
  for select using (true);

create policy sector_horizon_write_admin on public.sector_horizon
  for all using (public.is_admin()) with check (public.is_admin());

-- The view selects `sectors.*`, which Postgres expanded into a fixed column
-- list when it was created — the two columns above would never appear in it.
-- Dropped and rebuilt rather than replaced, because replacing may only append
-- columns and these land in the middle.
drop view public.sectors_with_stats;

create view public.sectors_with_stats as
select
  s.*,
  (s.deleted_at is not null or g.deleted_at is not null) as is_archived,
  count(r.id) as route_count,
  (array_agg(r.grade order by r.grade_score) filter (where r.id is not null))[1]
    as grade_min,
  (array_agg(r.grade_scale order by r.grade_score) filter (where r.id is not null))[1]
    as grade_min_scale,
  (array_agg(r.grade order by r.grade_score desc) filter (where r.id is not null))[1]
    as grade_max,
  (array_agg(r.grade_scale order by r.grade_score desc) filter (where r.id is not null))[1]
    as grade_max_scale,
  public.grade_histogram(array[s.id]) as grade_histogram
from public.sectors s
join public.regions g on g.id = s.id_region
left join public.routes r
  on r.id_sector = s.id and r.deleted_at is null
group by s.id, g.deleted_at;

alter view public.sectors_with_stats set (security_invoker = on);

-- Every sector that already has a pin is queued, so the profiles are built by
-- the backfill rather than appearing only for sectors edited from here on.
insert into public.sector_horizon (id_sector)
select id from public.sectors where lat is not null and lng is not null;
