-- The catalog was filled from 8a.nu and will be refilled from it again: route
-- stats change, ascents are logged, a re-parse has to land on the rows it
-- landed on last time. Until now the only link was the uuid5 the import
-- derived from the 8a id — recomputable, but invisible to the database and to
-- anything asking "which route is 8a's 146158". `id_route_8a` is that link
-- written down, and unique because two routes claiming one 8a id means the
-- import matched something wrong.
--
-- Nullable: a route somebody adds in the editor has no 8a id and never will.
alter table public.routes add column id_route_8a text;

create unique index routes_id_route_8a_idx on public.routes (id_route_8a)
  where id_route_8a is not null;

-- A tick imported from a scorecard has no id of its own to carry: 8a's ascent
-- list exposes the route and the date, not an ascent identifier. Those two
-- plus the climber are what identifies the ascent, so they are what a re-parse
-- upserts on — and a repeat of the same route on another day stays a separate
-- ascent, which is how 8a models it too.
create unique index ticks_user_route_day_idx
  on public.ticks (id_user, id_route, climbed_at);
