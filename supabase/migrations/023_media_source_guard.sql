-- The single SQL reading of a YouTube link, matching `idYoutubeOf` in the API
-- and `parseMediaLink` in the web app: host compared case-blind and without a
-- port, as `new URL()` does; the id keeps its case.
create function public.youtube_id_of(url text)
returns text
language sql
immutable
as $$
  select case
    when parts.host = 'youtu.be' then
      substring(parts.path from '^/([\w-]{5,32})(?:[/?#]|$)')
    when parts.host in ('youtube.com', 'www.youtube.com', 'm.youtube.com') then
      coalesce(
        substring(parts.path from '^/(?:shorts|embed|live)/([\w-]{5,32})(?:[/?#]|$)'),
        substring(parts.path from '^/[^?#]*\?(?:[^#]*&)?v=([\w-]{5,32})(?:[&#]|$)')
      )
  end
  from (
    select
      lower(substring(url from '(?i)^https?://([^/?#:]+)')) as host,
      substring(url from '(?i)^https?://[^/?#]*(.*)$') as path
  ) as parts
$$;

-- Whoever writes the row, the id comes from the link: a client-sent id could
-- claim someone else's video and lock it out of the catalog.
create function public.route_media_set_id_youtube()
returns trigger
language plpgsql
as $$
begin
  new.id_youtube := case when new.kind = 'video' then public.youtube_id_of(new.url) end;
  return new;
end;
$$;

create trigger route_media_set_id_youtube
  before insert or update of url, kind on public.route_media
  for each row execute function public.route_media_set_id_youtube();

-- Rows 022 could not read (an upper-case host, a port) or written since by an
-- import that sent no id. A video already held by another row stays off.
with candidates as (
  select
    id,
    public.youtube_id_of(url) as id_youtube,
    row_number() over (
      partition by public.youtube_id_of(url)
      order by created_at, id
    ) as rank
  from public.route_media
  where kind = 'video' and url is not null and id_youtube is null
)
update public.route_media m
set id_youtube = c.id_youtube
from candidates c
where m.id = c.id
  and c.id_youtube is not null
  and c.rank = 1
  and not exists (
    select 1 from public.route_media held where held.id_youtube = c.id_youtube
  );

-- The YouTube channel and publish date come from imports run with the service
-- role only; climbers write the rest of the row and nothing after it.
revoke insert, update on public.route_media from anon, authenticated;
grant insert (
  id_route, id_user, id_tick, kind, url, storage_path, title, duration_seconds
) on public.route_media to authenticated;
