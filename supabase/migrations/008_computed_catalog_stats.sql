-- Route counts and grade ranges were frozen columns filled in by hand at
-- import. The moment an admin edits a route they would start lying, so they
-- become derived: the tables keep only what a human types, the views compute
-- the rest.

-- Grades sort as text in the wrong order ("10a" < "5a", "6a+" > "6b"), so the
-- ordering key is stored next to the grade and kept in sync by the database.
alter table public.routes add column grade_rank integer
  generated always as (
    coalesce(nullif(substring(grade from '^[0-9]'), ''), '0')::integer * 100
    + case lower(coalesce(substring(grade from '^[0-9]([abc])'), ''))
        when 'b' then 10 when 'c' then 20 else 0 end
    + case when grade like '%+' then 5 else 0 end
  ) stored;

alter table public.sectors drop column route_count, drop column grade_range;
alter table public.regions
  drop column sector_count, drop column route_count, drop column grade_range;

create view public.sectors_with_stats as
select
  s.*,
  count(r.id) as route_count,
  (array_agg(r.grade order by r.grade_rank) filter (where r.id is not null))[1] as grade_min,
  (array_agg(r.grade order by r.grade_rank desc) filter (where r.id is not null))[1] as grade_max
from public.sectors s
left join public.routes r on r.id_sector = s.id
group by s.id;

create view public.regions_with_stats as
select
  g.*,
  count(distinct s.id) as sector_count,
  count(r.id) as route_count,
  (array_agg(r.grade order by r.grade_rank) filter (where r.id is not null))[1] as grade_min,
  (array_agg(r.grade order by r.grade_rank desc) filter (where r.id is not null))[1] as grade_max
from public.regions g
left join public.sectors s on s.id_region = g.id
left join public.routes r on r.id_sector = s.id
group by g.id;

-- Without this a view runs as its owner and quietly bypasses the RLS of the
-- tables underneath it.
alter view public.sectors_with_stats set (security_invoker = on);
alter view public.regions_with_stats set (security_invoker = on);
