-- A region's card has nothing to show but a placeholder. Its cover lives in
-- storage like a topo photo does, with the key kept on the row.

alter table public.regions add column photo_path text;

-- The stats view expands regions.*, so it has to be rebuilt to see the column.
drop view public.regions_with_stats;

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

alter view public.regions_with_stats set (security_invoker = on);

-- Public bucket, for the same reason the topos one is: these images are what
-- the page renders, and a signed URL per image would only add expiry handling.
insert into storage.buckets (id, name, public)
values ('regions', 'regions', true)
on conflict (id) do nothing;

create policy "regions_read_public" on storage.objects
  for select using (bucket_id = 'regions');

create policy "regions_write_admin" on storage.objects
  for all using (bucket_id = 'regions' and public.is_admin())
  with check (bucket_id = 'regions' and public.is_admin());
