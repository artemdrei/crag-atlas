-- Deleting a catalog row must not take the climbing people did on it. A
-- region, a sector and a route are all marked gone instead of removed, and the
-- mark goes only where the click was: delete a region and its sectors keep no
-- mark of their own. Being out of the catalog is therefore derived — a row is
-- archived when it carries the mark itself or any of its ancestors does — so
-- restoring is one UPDATE of one row, and a sector deleted on its own stays
-- deleted when its region comes back.
alter table public.routes add column deleted_at timestamptz;
alter table public.sectors add column deleted_at timestamptz;
alter table public.regions add column deleted_at timestamptz;

create index routes_alive_id_sector_idx
  on public.routes (id_sector)
  where deleted_at is null;

create index sectors_alive_id_region_idx
  on public.sectors (id_region)
  where deleted_at is null;

create index regions_alive_idx
  on public.regions (name)
  where deleted_at is null;

-- `select r.*` freezes the column list when the view is created, so every view
-- over these tables is rebuilt here to pick deleted_at up. IF EXISTS because
-- this migration defines the four of them outright — whatever shape an earlier
-- one left behind is replaced, not patched.
drop view if exists public.regions_with_stats;
drop view if exists public.sectors_with_stats;
drop view if exists public.routes_with_stats;
drop view if exists public.sector_grade_counts;

-- The counts below deliberately look at each row's OWN mark, never at
-- is_archived: an archived region's page still lists the sectors it held, and
-- an archived sector still shows its routes. Hiding them from the catalog is
-- what is_archived is for; emptying them out is not.

create view public.routes_with_stats as
select
  r.*,
  (r.deleted_at is not null
    or s.deleted_at is not null
    or g.deleted_at is not null) as is_archived,
  case
    when coalesce(r.rating_external_votes, 0) + count(t.rating) = 0 then null
    else (
      coalesce(r.rating_external, 0) * coalesce(r.rating_external_votes, 0)
      + coalesce(sum(t.rating), 0)
    ) / (coalesce(r.rating_external_votes, 0) + count(t.rating))
  end as rating,
  coalesce(r.rating_external_votes, 0) + count(t.rating) as rating_votes,
  coalesce(r.ascents_count, 0) + count(t.id) as ascents_count_total,
  coalesce(r.onsight_count, 0)
    + count(t.id) filter (where t.ascent_type = 'onsight') as onsight_count_total,
  coalesce(r.votes_soft, 0)
    + count(t.id) filter (where t.grade_opinion = 'soft') as votes_soft_total,
  coalesce(r.votes_neutral, 0)
    + count(t.id) filter (where t.grade_opinion = 'neutral') as votes_neutral_total,
  coalesce(r.votes_hard, 0)
    + count(t.id) filter (where t.grade_opinion = 'hard') as votes_hard_total
from public.routes r
join public.sectors s on s.id = r.id_sector
join public.regions g on g.id = s.id_region
left join public.ticks t on t.id_route = r.id
group by r.id, s.deleted_at, g.deleted_at;

create view public.sector_grade_counts as
select
  r.id_sector,
  r.type,
  r.grade,
  r.grade_scale,
  count(*) as route_count,
  min(r.grade_score) as grade_score
from public.routes r
where r.deleted_at is null
group by r.id_sector, r.type, r.grade, r.grade_scale;

-- The filter rides on the join, not on a where: a sector whose every route is
-- gone must still come back with route_count 0, not drop out of the catalog.
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

create view public.regions_with_stats as
select
  g.*,
  (g.deleted_at is not null) as is_archived,
  count(distinct s.id) as sector_count,
  count(r.id) as route_count,
  (array_agg(r.grade order by r.grade_score) filter (where r.id is not null))[1]
    as grade_min,
  (array_agg(r.grade_scale order by r.grade_score) filter (where r.id is not null))[1]
    as grade_min_scale,
  (array_agg(r.grade order by r.grade_score desc) filter (where r.id is not null))[1]
    as grade_max,
  (array_agg(r.grade_scale order by r.grade_score desc) filter (where r.id is not null))[1]
    as grade_max_scale,
  public.grade_histogram(array_agg(distinct s.id) filter (where s.id is not null))
    as grade_histogram
from public.regions g
left join public.sectors s
  on s.id_region = g.id and s.deleted_at is null
left join public.routes r
  on r.id_sector = s.id and r.deleted_at is null
group by g.id;

alter view public.routes_with_stats set (security_invoker = on);
alter view public.sector_grade_counts set (security_invoker = on);
alter view public.sectors_with_stats set (security_invoker = on);
alter view public.regions_with_stats set (security_invoker = on);
