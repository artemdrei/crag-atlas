-- Who bolted a route, and in what year. Optional: most of the catalog will
-- never know, and a guidebook that does usually knows the year alone.
--
-- Two columns for one person because most bolters have no account here: an
-- admin picks a climber when there is one and types a name when there is not.
-- At most one is set — never both, so there is no pair to disagree.
alter table public.routes
  add column id_bolter uuid references public.users (id) on delete set null,
  add column bolter_name text,
  add column bolted_year integer,
  add constraint routes_bolter_one_of
    check (num_nonnulls(id_bolter, bolter_name) <= 1),
  add constraint routes_bolted_year_range
    check (bolted_year is null or bolted_year between 1900 and 2100);

-- `select r.*` froze the column list when the view was created, so the three
-- columns above reach the API only through a rebuild. The join is new: the
-- route page shows the bolter's name the way it shows a sector's, and going
-- back for one display_name would cost a round trip per route.
drop view if exists public.routes_with_stats;

create view public.routes_with_stats as
select
  r.*,
  -- The name to print, wherever it came from. `r.bolter_name` stays visible
  -- beside it under its own name, so an editor can tell the two apart.
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
left join public.ticks t on t.id_route = r.id
-- The ascent aggregates group by the route; the bolter's own columns come
-- from a row the route points at, so they have to be named here too.
group by r.id, s.deleted_at, g.deleted_at, u.display_name, u.avatar_url;

alter view public.routes_with_stats set (security_invoker = on);
