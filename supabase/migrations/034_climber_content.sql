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
