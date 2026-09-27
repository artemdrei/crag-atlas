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
