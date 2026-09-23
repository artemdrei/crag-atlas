-- What the log form collects beyond the bare ascent.
alter table public.ticks
  add column rating smallint
    check (rating is null or rating between 1 and 5),
  add column grade_opinion text
    check (grade_opinion is null or grade_opinion in ('soft', 'neutral', 'hard')),
  add column id_partner uuid references public.users (id) on delete set null;

-- The imported score stops being the shown number and becomes a seed the
-- importer owns: a re-parse replaces this pair, our own votes stay untouched,
-- and the shown rating is derived from both.
alter table public.routes rename column rating to rating_external;

alter table public.routes
  add column rating_external_votes integer
    check (rating_external_votes is null or rating_external_votes >= 0),
  add column external_synced_at timestamptz;

-- 8a.nu builds its score out of the ascents it knows, so those ascents are how
-- much the imported average weighs against ours.
update public.routes
set rating_external_votes = ascents_count
where rating_external is not null;

-- Counts and the rating carry on from the imported numbers instead of starting
-- over, the way the other catalog stats are already derived rather than stored.
create view public.routes_with_stats as
select
  r.*,
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
    + count(t.id) filter (where t.ascent_style = 'onsight') as onsight_count_total,
  coalesce(r.votes_soft, 0)
    + count(t.id) filter (where t.grade_opinion = 'soft') as votes_soft_total,
  coalesce(r.votes_neutral, 0)
    + count(t.id) filter (where t.grade_opinion = 'neutral') as votes_neutral_total,
  coalesce(r.votes_hard, 0)
    + count(t.id) filter (where t.grade_opinion = 'hard') as votes_hard_total
from public.routes r
left join public.ticks t on t.id_route = r.id
group by r.id;

alter view public.routes_with_stats set (security_invoker = on);

-- Media logged with an ascent belongs to it: deleting the ascent takes it away.
-- An uploaded photo keeps its storage path so the file can be removed with the
-- row; a link keeps only its url.
alter table public.route_media
  add column id_tick uuid references public.ticks (id) on delete cascade,
  add column storage_path text;

create index route_media_id_tick_idx on public.route_media (id_tick);
