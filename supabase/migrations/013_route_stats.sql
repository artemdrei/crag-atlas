-- Numbers the community produces rather than the route owner: how often it has
-- been climbed, how often onsight, and how the grade votes split. All optional
-- — a freshly bolted route has none of them.

alter table public.routes
  add column ascents_count integer
    check (ascents_count is null or ascents_count >= 0),
  add column onsight_count integer
    check (onsight_count is null or onsight_count >= 0),
  add column votes_soft integer
    check (votes_soft is null or votes_soft >= 0),
  add column votes_neutral integer
    check (votes_neutral is null or votes_neutral >= 0),
  add column votes_hard integer
    check (votes_hard is null or votes_hard >= 0);
