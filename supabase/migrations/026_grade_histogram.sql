-- Grade spread per sector, grouped by climbing type: a boulder grade and a
-- route grade never share an axis.
create view public.sector_grade_counts as
select
  r.id_sector,
  r.type,
  r.grade,
  r.grade_scale,
  count(*) as route_count,
  min(r.grade_score) as grade_score
from public.routes r
group by r.id_sector, r.type, r.grade, r.grade_scale;

alter view public.sector_grade_counts set (security_invoker = on);

-- Ordered explicitly: jsonb keeps the order it is built in. Grouped twice
-- before the aggregate, so the same grade in two sectors of a region is one
-- bucket.
create function public.grade_histogram(sector_ids uuid[])
returns jsonb
language sql
stable
set search_path = ''
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'type', t.type,
        'routeCount', t.route_count,
        'grades', t.grades
      )
      order by array_position(array['sport', 'trad', 'boulder'], t.type)
    ),
    '[]'::jsonb
  )
  from (
    select
      g.type,
      sum(g.route_count) as route_count,
      jsonb_agg(
        jsonb_build_object(
          'grade', g.grade,
          'scale', g.grade_scale,
          'count', g.route_count
        )
        order by g.grade_score, g.grade
      ) as grades
    from (
      select
        c.type,
        c.grade,
        c.grade_scale,
        sum(c.route_count) as route_count,
        min(c.grade_score) as grade_score
      from public.sector_grade_counts c
      where c.id_sector = any(sector_ids)
      group by c.type, c.grade, c.grade_scale
    ) g
    group by g.type
  ) t;
$$;

-- The histogram arrives as a scalar subquery, never as a join: joining it into
-- the chain below would multiply every route row by the number of grade groups
-- in its sector and inflate route_count.
drop view public.sectors_with_stats;
drop view public.regions_with_stats;

create view public.sectors_with_stats as
select
  s.*,
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
left join public.routes r on r.id_sector = s.id
group by s.id;

create view public.regions_with_stats as
select
  g.*,
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
left join public.sectors s on s.id_region = g.id
left join public.routes r on r.id_sector = s.id
group by g.id;

alter view public.sectors_with_stats set (security_invoker = on);
alter view public.regions_with_stats set (security_invoker = on);
