-- Where the sector is, so the map is the same for everyone instead of living in
-- one browser's local storage.
alter table public.sectors
  add column lat double precision,
  add column lng double precision;

alter table public.sectors
  add constraint sectors_point_complete check ((lat is null) = (lng is null)),
  add constraint sectors_lat_range check (lat is null or lat between -90 and 90),
  add constraint sectors_lng_range check (lng is null or lng between -180 and 180);

-- The view froze its column list when "s.*" was expanded at creation, so the
-- two new columns reach it only through a rebuild. REPLACE cannot do it: the
-- columns land in the middle of the list, and REPLACE only appends.
drop view public.sectors_with_stats;

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

alter view public.sectors_with_stats set (security_invoker = on);
