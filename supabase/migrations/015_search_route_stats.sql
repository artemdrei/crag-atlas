-- A route in the search list is chosen by more than its name and rating: how
-- often it has been climbed and how many bolts it carries say as much. Both
-- already exist on `routes_with_stats`, which the routes branch reads, so only
-- that branch changes.

create or replace function public.catalog_search(
  term text,
  max_rows integer default 5
)
returns jsonb
language sql
stable
set search_path = ''
as $$
  -- Three branches read this, and at three references Postgres materializes a
  -- CTE by default. A materialized `pattern` is a second relation, so the
  -- ilike can no longer be pushed into the scan and lands above the view's
  -- aggregate instead: every route in the catalog gets grouped against its
  -- ticks before a single name is compared.
  with pattern as not materialized (
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
          'sectorName', s.name,
          'grade', r.grade,
          'gradeScale', r.grade_scale,
          'rating', r.rating,
          'boltsCount', r.bolts_count,
          'ascentsCount', r.ascents_count_total
        ) as hit
        from public.routes_with_stats r
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
