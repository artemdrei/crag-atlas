-- A video is one YouTube id however it was linked: youtu.be, watch?v=, shorts
-- and a `&t=` all name the same clip. The patterns follow `parseMediaLink` in
-- the web app and `idYoutubeOf` in the API; `youtube_id_of()` in 023 reads
-- every later write.
alter table public.route_media add column id_youtube text;

-- Where the video came from on YouTube and when it went up there, apart from
-- who linked it here and when.
alter table public.route_media
  add column channel_name text,
  add column channel_url text,
  add column published_at timestamptz;

update public.route_media
set id_youtube = coalesce(
  substring(url from '^https?://youtu\.be/([\w-]{5,32})(?:[/?#]|$)'),
  substring(
    url
    from '^https?://(?:www\.|m\.)?youtube\.com/(?:shorts|embed|live)/([\w-]{5,32})(?:[/?#]|$)'
  ),
  substring(
    url
    from '^https?://(?:www\.|m\.)?youtube\.com/[^?#]*\?(?:[^#]*&)?v=([\w-]{5,32})(?:[&#]|$)'
  )
)
where kind = 'video' and url is not null;

-- The first climber to link a video keeps it in the gallery. Later copies stay
-- on their route and tick, just without the id the unique key is on.
update public.route_media later
set id_youtube = null
from public.route_media earlier
where later.id_youtube = earlier.id_youtube
  and (earlier.created_at, earlier.id) < (later.created_at, later.id);

create unique index route_media_id_youtube_key
  on public.route_media (id_youtube);

create index route_media_gallery_idx
  on public.route_media (coalesce(published_at, created_at) desc, id desc)
  where id_youtube is not null;

-- The gallery reads every linked video across the catalog, newest on YouTube
-- first where the date is known, filtered by what the climber typed and the
-- grade band. Paged by key rather than offset: a video added while someone
-- scrolls must not repeat a card. `cursor_created_at` carries that sort key.
create function public.media_page(
  term text default null,
  grade_min real default null,
  grade_max real default null,
  newest_first boolean default true,
  cursor_created_at timestamptz default null,
  id_cursor uuid default null,
  page_limit integer default 24
)
returns jsonb
language sql
stable
set search_path = ''
as $$
  with scoped as (
    select m.id, coalesce(m.published_at, m.created_at) as sorted_at
    from public.route_media m
    join public.routes r on r.id = m.id_route
    join public.sectors s on s.id = r.id_sector
    join public.regions g on g.id = s.id_region
    left join public.users u on u.id = m.id_user
    where m.id_youtube is not null
      and r.deleted_at is null
      and s.deleted_at is null
      and g.deleted_at is null
      and (
        (media_page.grade_min is null and media_page.grade_max is null)
        or (
          r.grade_scale not in ('font', 'vscale')
          and r.grade_score >= coalesce(media_page.grade_min, '-infinity')
          and r.grade_score <= coalesce(media_page.grade_max, 'infinity')
        )
      )
      and (
        coalesce(trim(media_page.term), '') = ''
        or r.name ilike '%' || trim(media_page.term) || '%'
        or r.name_local ilike '%' || trim(media_page.term) || '%'
        or u.display_name ilike '%' || trim(media_page.term) || '%'
        or m.channel_name ilike '%' || trim(media_page.term) || '%'
      )
  ),
  page as (
    select sc.id, sc.sorted_at
    from scoped sc
    where media_page.id_cursor is null
      or (
        media_page.newest_first
        and (sc.sorted_at, sc.id)
          < (media_page.cursor_created_at, media_page.id_cursor)
      )
      or (
        not media_page.newest_first
        and (sc.sorted_at, sc.id)
          > (media_page.cursor_created_at, media_page.id_cursor)
      )
    order by
      case when media_page.newest_first then sc.sorted_at end desc,
      case when media_page.newest_first then sc.id end desc,
      sc.sorted_at asc,
      sc.id asc
    limit greatest(media_page.page_limit, 1)
  )
  select jsonb_build_object(
    'total', (select count(*) from scoped),
    'ids', coalesce(
      (
        select jsonb_agg(p.id order by
          case when media_page.newest_first then p.sorted_at end desc,
          case when media_page.newest_first then p.id end desc,
          p.sorted_at asc,
          p.id asc
        )
        from page p
      ),
      '[]'::jsonb
    )
  );
$$;

grant execute on function
  public.media_page(text, real, real, boolean, timestamptz, uuid, integer)
  to anon, authenticated;

-- A video title usually carries the route name ("Pyrih i batih 6c+ redpoint"),
-- so the longest name found inside it is the guess. A name shared by two live
-- routes is no guess at all: the climber picks the sector themselves.
create function public.route_in_title(title text)
returns uuid
language sql
stable
set search_path = ''
as $$
  with hits as (
    select r.id, length(r.name) as name_length
    from public.routes r
    join public.sectors s on s.id = r.id_sector
    join public.regions g on g.id = s.id_region
    where r.deleted_at is null
      and s.deleted_at is null
      and g.deleted_at is null
      and length(r.name) >= 3
      and (
        strpos(lower(route_in_title.title), lower(r.name)) > 0
        or strpos(lower(route_in_title.title), lower(r.name_local)) > 0
      )
  ),
  longest as (
    select h.id
    from hits h
    where h.name_length = (select max(name_length) from hits)
  )
  select id from longest where (select count(*) from longest) = 1;
$$;

grant execute on function public.route_in_title(text) to anon, authenticated;
