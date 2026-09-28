-- Everything the API reads instead of assembling in JavaScript: the stats each
-- catalog page shows, and the four functions that answer a whole screen in one
-- round trip.
--
-- Every view is security_invoker: owned by postgres, it would otherwise read
-- the tables as postgres and hand back rows RLS is meant to hide.

-- Grade spread per sector, grouped by climbing type: a boulder grade and a
-- route grade never share an axis. Archived routes are left out — the spread
-- describes what a visitor can climb.
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
    + count(t.id) filter (where t.grade_opinion = 'hard') as votes_hard_total,
  exists (
    select 1 from public.route_media m
    where m.id_route = r.id and m.kind = 'photo'
  ) as has_photo,
  exists (
    select 1 from public.route_media m
    where m.id_route = r.id and m.kind = 'video'
  ) as has_video
from public.routes r
join public.sectors s on s.id = r.id_sector
join public.regions g on g.id = s.id_region
left join public.ticks t on t.id_route = r.id
group by r.id, s.deleted_at, g.deleted_at;

alter view public.sectors_with_stats set (security_invoker = on);
alter view public.regions_with_stats set (security_invoker = on);
alter view public.routes_with_stats set (security_invoker = on);

-- Whether a catalog row can be erased is one question, so it is one query.
-- The API used to walk the tree itself — region to sector ids, sector ids to
-- route ids, then three counts keyed by that id list — which put every uuid of
-- a region on the wire three times to decide whether one button is enabled.
create or replace function public.climber_content(
  id_region uuid default null,
  id_sector uuid default null,
  id_route uuid default null
)
returns jsonb
language sql
stable
set search_path = ''
as $$
  -- Qualified by the function name: `id_sector` and `id_region` are also
  -- columns of the tables below, and on a bare name the column wins — which
  -- turns the filter into `s.id_region = s.id_region` and scopes every region
  -- to the whole catalog.
  with scope as (
    select r.id
    from public.routes r
    join public.sectors s on s.id = r.id_sector
    where (climber_content.id_route is null or r.id = climber_content.id_route)
      and (climber_content.id_sector is null
        or r.id_sector = climber_content.id_sector)
      and (climber_content.id_region is null
        or s.id_region = climber_content.id_region)
  )
  select jsonb_build_object(
    'ascents',
      (select count(*) from public.ticks t join scope on scope.id = t.id_route),
    'comments',
      (select count(*) from public.route_comments c join scope on scope.id = c.id_route),
    'media',
      (select count(*) from public.route_media m join scope on scope.id = m.id_route)
  );
$$;

-- Reading it needs no more rights than reading the catalog it counts.
grant execute on function public.climber_content(uuid, uuid, uuid) to anon, authenticated;

-- A logbook of a thousand ascents cannot be answered in one response, and a
-- page of it cannot be filtered or ordered in the browser without lying about
-- what the other pages hold. Both questions are answered here: which ids make
-- up a page of the filtered, ordered logbook, and what the whole of it counts.

-- Sport and boulder grades never convert into each other, so the two are
-- counted and paged apart; the scale says which family a tick belongs to.
create or replace function public.tick_page(
  id_user uuid,
  discipline text default null,
  ascent_type text default null,
  sort text default 'date',
  page_limit integer default 100,
  page_offset integer default 0
)
returns jsonb
language sql
stable
set search_path = ''
as $$
  with scoped as (
    select t.id, t.climbed_at, r.grade_score
    from public.ticks t
    join public.routes r on r.id = t.id_route
    where t.id_user = tick_page.id_user
      and (
        tick_page.ascent_type is null
        or t.ascent_type = tick_page.ascent_type
      )
      and (
        tick_page.discipline is null
        or (tick_page.discipline = 'boulder')
          = (r.grade_scale in ('font', 'vscale'))
      )
  ),
  page as (
    select
      s.id,
      row_number() over (
        order by
          case when tick_page.sort = 'grade' then s.grade_score end
            desc nulls last,
          s.climbed_at desc,
          s.id desc
      ) as position
    from scoped s
    order by position
    limit greatest(tick_page.page_limit, 1)
    offset greatest(tick_page.page_offset, 0)
  )
  select jsonb_build_object(
    'total', (select count(*) from scoped),
    'ids', coalesce(
      (select jsonb_agg(p.id order by p.position) from page p),
      '[]'::jsonb
    )
  );
$$;

-- The chart draws every ascent, not the page on screen, so the spread comes
-- from the database rather than from whatever the list has loaded.
create or replace function public.tick_stats(id_user uuid)
returns jsonb
language sql
stable
set search_path = ''
as $$
  with counted as (
    select
      r.grade,
      r.grade_scale,
      t.ascent_type,
      count(*) as ascents
    from public.ticks t
    join public.routes r on r.id = t.id_route
    where t.id_user = tick_stats.id_user
    group by r.grade, r.grade_scale, t.ascent_type
  )
  select jsonb_build_object(
    'sportCount', coalesce((
      select sum(ascents) from counted
      where grade_scale not in ('font', 'vscale')
    ), 0),
    'boulderCount', coalesce((
      select sum(ascents) from counted
      where grade_scale in ('font', 'vscale')
    ), 0),
    'grades', coalesce((
      select jsonb_agg(jsonb_build_object(
        'grade', grade,
        'scale', grade_scale,
        'ascentType', ascent_type,
        'count', ascents
      ))
      from counted
    ), '[]'::jsonb)
  );
$$;

grant execute on function
  public.tick_page(uuid, text, text, text, integer, integer) to authenticated;
grant execute on function public.tick_stats(uuid) to authenticated;

-- Three lookups in one round trip, each carrying the ids a link to the row
-- needs. Archived rows are left out: search is for the catalog on display.
-- Each branch orders before it cuts, so the five rows that come back are the
-- first five by name rather than whichever five the planner reached first.
create or replace function public.catalog_search(
  term text,
  max_rows integer default 5
)
returns jsonb
language sql
stable
set search_path = ''
as $$
  with pattern as (
    select '%' || trim(catalog_search.term) || '%' as like_term
  )
  select jsonb_build_object(
    'regions', coalesce((
      select jsonb_agg(hit order by hit->>'name')
      from (
        select jsonb_build_object(
          'id', g.id,
          'name', g.name,
          'nameLocal', g.name_local,
          'idRegion', g.id
        ) as hit
        from public.regions g, pattern p
        where g.deleted_at is null
          and (g.name ilike p.like_term or g.name_local ilike p.like_term)
        order by g.name
        limit greatest(catalog_search.max_rows, 1)
      ) rows
    ), '[]'::jsonb),
    'sectors', coalesce((
      select jsonb_agg(hit order by hit->>'name')
      from (
        select jsonb_build_object(
          'id', s.id,
          'name', s.name,
          'nameLocal', s.name_local,
          'idRegion', s.id_region,
          'idSector', s.id,
          'regionName', g.name
        ) as hit
        from public.sectors s
        join public.regions g on g.id = s.id_region
        cross join pattern p
        where s.deleted_at is null
          and g.deleted_at is null
          and (s.name ilike p.like_term or s.name_local ilike p.like_term)
        order by s.name
        limit greatest(catalog_search.max_rows, 1)
      ) rows
    ), '[]'::jsonb),
    'routes', coalesce((
      select jsonb_agg(hit order by hit->>'name')
      from (
        select jsonb_build_object(
          'id', r.id,
          'name', r.name,
          'nameLocal', r.name_local,
          'idRegion', s.id_region,
          'idSector', r.id_sector,
          'idRoute', r.id,
          'regionName', g.name,
          'sectorName', s.name
        ) as hit
        from public.routes r
        join public.sectors s on s.id = r.id_sector
        join public.regions g on g.id = s.id_region
        cross join pattern p
        where r.deleted_at is null
          and s.deleted_at is null
          and g.deleted_at is null
          and (r.name ilike p.like_term or r.name_local ilike p.like_term)
        order by r.name
        limit greatest(catalog_search.max_rows, 1)
      ) rows
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.catalog_search(text, integer)
  to anon, authenticated;
