-- A grade means nothing without the scale it was written in: "7a" is French
-- sport, Fontainebleau bouldering or Saxon depending on the guidebook. The
-- scale travels with the route so an imported catalog keeps its own notation,
-- and every reader can be shown the grade in the system they think in.

-- Trad routes need their own protection grade to be worth the distinction, and
-- nothing in the app makes that distinction today. This runs first: it is
-- independent of the rest and the likeliest step to fail.
update public.routes set type = 'sport' where type = 'trad';

-- The inline check from migration 006 carries a name Postgres generated, and
-- that name depends on which checks the table had at creation time.
do $$
declare constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.routes'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%type%sport%';

  if constraint_name is null then
    raise exception 'No check constraint on routes.type to replace.';
  end if;

  execute format('alter table public.routes drop constraint %I', constraint_name);
end $$;

alter table public.routes
  add constraint routes_type_check check (type in ('sport', 'boulder'));

alter table public.routes
  add column grade_scale text not null default 'french'
    check (grade_scale in (
      'french', 'yds', 'uiaa', 'saxon', 'ewbank', 'norwegian',
      'brazilian_crux', 'font', 'vscale'
    )),
  -- Sorting key on the scale's own axis, written by the API from sandbag.
  -- Postgres cannot compute it: the conversion tables live in JavaScript.
  add column grade_score real;

-- The default only exists to fill the rows already in the table.
alter table public.routes alter column grade_scale drop default;

-- The whole French scale as sandbag scores it, so the backfill does not
-- depend on which of its grades the catalog happens to use today.
update public.routes r
set grade_score = v.grade_score
from (values
  ('1a', 0.5), ('1a+', 2.5), ('1b', 4.5),
  ('1b+', 6.5), ('1c', 8.5), ('1c+', 10.5),
  ('2a', 12.5), ('2a+', 14.5), ('2b', 16.5),
  ('2b+', 18.5), ('2c', 20.5), ('2c+', 22.5),
  ('3a', 24.5), ('3a+', 26.5), ('3b', 28.5),
  ('3b+', 30.5), ('3c', 32.5), ('3c+', 34.5),
  ('4a', 36.5), ('4a+', 38.5), ('4b', 40.5),
  ('4b+', 42.5), ('4c', 44.5), ('4c+', 46.5),
  ('5a', 48.5), ('5a+', 50.5), ('5b', 52.5),
  ('5b+', 54.5), ('5c', 56.5), ('5c+', 58.5),
  ('6a', 60.5), ('6a+', 62.5), ('6b', 64.5),
  ('6b+', 66.5), ('6c', 68.5), ('6c+', 70.5),
  ('7a', 72.5), ('7a+', 74.5), ('7b', 76.5),
  ('7b+', 78.5), ('7c', 80.5), ('7c+', 82.5),
  ('8a', 84.5), ('8a+', 86.5), ('8b', 88.5),
  ('8b+', 90.5), ('8c', 92.5), ('8c+', 94.5),
  ('9a', 96.5), ('9a+', 98.5), ('9b', 100.5),
  ('9b+', 102.5), ('9c', 104.5), ('9c+', 106.5)
) as v (grade, grade_score)
where r.grade = v.grade;

-- A grade edited in since this file was written would land here as null and
-- fail the constraint below with nothing to go on. Name it instead.
do $$
declare missing text;
begin
  select string_agg(distinct grade, ', ') into missing
  from public.routes where grade_score is null;

  if missing is not null then
    raise exception 'No score for grade(s): %. Add them to the values list above.', missing;
  end if;
end $$;

alter table public.routes alter column grade_score set not null;

create index routes_grade_score_idx on public.routes (grade_score);

-- Replaced by grade_score: the old key parsed the French notation with a
-- regex and had no way to rank a route graded in any other system.
drop view public.regions_with_stats;
drop view public.sectors_with_stats;
alter table public.routes drop column grade_rank;

-- Migration 012 never got to drop this: sectors_with_stats expands s.* and so
-- depended on the column. With both views down this is the window for it.
alter table public.sectors drop column if exists approach_minutes;

-- The range endpoints come from two different routes, so each carries the
-- scale it was written in — without it a client cannot convert either one.
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
    as grade_max_scale
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
    as grade_max_scale
from public.regions g
left join public.sectors s on s.id_region = g.id
left join public.routes r on r.id_sector = s.id
group by g.id;

-- Two preferences, not one: the grade a climber thinks in differs between
-- rope routes and boulders, and the two scale families never convert into
-- each other. Null means "show the grade as the guidebook wrote it".
alter table public.users
  add column grade_scale_route text
    check (grade_scale_route is null or grade_scale_route in (
      'french', 'yds', 'uiaa', 'saxon', 'ewbank', 'norwegian', 'brazilian_crux'
    )),
  add column grade_scale_boulder text
    check (grade_scale_boulder is null or grade_scale_boulder in ('font', 'vscale'));
