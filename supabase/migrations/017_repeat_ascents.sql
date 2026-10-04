-- A route climbed again is a new ascent with its own hour and weather, so the
-- one-tick-per-day key goes. Nothing re-imports on it: the 8a scorecards were
-- loaded once.
drop index public.ticks_user_route_day_idx;

create index ticks_user_route_climbed_idx
  on public.ticks (id_user, id_route, climbed_at);

-- A repeat is a send of a route the climber had already sent. Attempts never
-- count as a send, so projecting a route leaves its redpoint the first ascent.
-- Derived rather than stored: deleting the first send promotes the next one
-- without anything to keep in step.
--
-- Takes the row, so PostgREST exposes it as a computed `is_repeat` column the
-- API can filter on.
create function public.is_repeat(tick public.ticks)
returns boolean
language sql
stable
set search_path = ''
as $$
  select tick.ascent_type <> 'attempt' and exists (
    select 1
    from public.ticks earlier
    where earlier.id_user = tick.id_user
      and earlier.id_route = tick.id_route
      and earlier.ascent_type <> 'attempt'
      and (
        earlier.climbed_at,
        coalesce(earlier.climbed_at_time, time '00:00'),
        earlier.created_at,
        earlier.id
      ) < (
        tick.climbed_at,
        coalesce(tick.climbed_at_time, time '00:00'),
        tick.created_at,
        tick.id
      )
  );
$$;

grant execute on function public.is_repeat(public.ticks) to anon, authenticated;

-- Onsight and flash describe a first meeting with the route, so only the first
-- send may carry them. Checked after the write and across the whole route:
-- logging an earlier send turns a later onsight into a repeat too.
create function public.assert_first_ascent_style() returns trigger
  language plpgsql
  set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.ticks t
    where t.id_user = new.id_user
      and t.id_route = new.id_route
      and t.ascent_type in ('onsight', 'flash', 'retro_flash')
      and public.is_repeat(t)
  ) then
    raise exception 'Only the first ascent of a route can be an onsight or a flash'
      using errcode = 'CA001';
  end if;

  return null;
end;
$$;

create trigger ticks_first_ascent_style_insert
  after insert on public.ticks
  for each row
  when (new.ascent_type <> 'attempt')
  execute function public.assert_first_ascent_style();

-- Every save rewrites the time, so only a real change to the order or the
-- style re-checks the route.
create trigger ticks_first_ascent_style_update
  after update on public.ticks
  for each row
  when (
    new.ascent_type <> 'attempt'
    and (old.id_route, old.ascent_type, old.climbed_at, old.climbed_at_time)
      is distinct from
      (new.id_route, new.ascent_type, new.climbed_at, new.climbed_at_time)
  )
  execute function public.assert_first_ascent_style();

-- Everyone else reads the first send only, so the route's numbers are counted
-- from the same ascents its logbook lists. Dropped rather than replaced:
-- `r.*` expands to a column list that has grown since 008.
drop view public.routes_with_stats;

create view public.routes_with_stats as
select
  r.*,
  coalesce(r.bolter_name, u.display_name) as bolter_label,
  u.avatar_url as bolter_avatar_url,
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
left join public.users u on u.id = r.id_bolter
left join public.ticks t on t.id_route = r.id and not public.is_repeat(t)
group by r.id, s.deleted_at, g.deleted_at, u.display_name, u.avatar_url;

alter view public.routes_with_stats set (security_invoker = on);

-- The logbook lists first sends; each carries how many repeats fold under it,
-- and those are fetched on their own, outside any filter or order.
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
    select t.id, t.id_route, t.ascent_type, t.climbed_at, r.grade_score
    from public.ticks t
    join public.routes r on r.id = t.id_route
    where t.id_user = tick_page.id_user
      and not public.is_repeat(t)
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
      s.id_route,
      s.ascent_type,
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
    ),
    'repeats', coalesce(
      (
        select jsonb_object_agg(p.id, (
          select count(*)
          from public.ticks e
          where e.id_user = tick_page.id_user
            and e.id_route = p.id_route
            and e.id <> p.id
            and e.ascent_type <> 'attempt'
        ))
        from page p
        where p.ascent_type <> 'attempt'
      ),
      '{}'::jsonb
    )
  );
$$;

-- The pyramid counts routes sent, as the logbook lists them.
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
      and not public.is_repeat(t)
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
