-- A route list shows whether a route has any photo or video, so the strip does
-- not have to be fetched per row. Both are EXISTS subqueries, never a join:
-- the view already groups over ticks, and a second join would multiply every
-- count hanging off it — ascents, ratings, grade votes.
drop view if exists public.routes_with_stats;

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

alter view public.routes_with_stats set (security_invoker = on);

create index if not exists route_media_id_route_kind_idx
  on public.route_media (id_route, kind);
