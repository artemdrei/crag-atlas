-- Now that routes live in the database, a tick can point at a real row.
-- restrict, not cascade: deleting a route must never quietly erase somebody's
-- logbook — the route has to be dealt with first.

alter table public.ticks
  add constraint ticks_id_route_fkey
  foreign key (id_route) references public.routes (id) on delete restrict;
