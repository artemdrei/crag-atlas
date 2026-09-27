-- Where a region is, beyond its province. ISO 3166-1 alpha-2, so the label a
-- reader sees is resolved in their own locale instead of stored in one.
alter table public.regions
  add column country text
    check (country is null or country ~ '^[A-Z]{2}$');

-- `select g.*` froze the column list when the view was created, so the view
-- has to be rebuilt for country to reach the API.
drop view if exists public.regions_with_stats;

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

alter view public.regions_with_stats set (security_invoker = on);
