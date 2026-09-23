-- Ascents were already protected by a restrict, but comments and media were
-- not: erasing a route for good would have taken the beta somebody wrote and
-- the photos and video links they attached. All three are climbers' own work,
-- and the catalog does not get to destroy any of them.
--
-- The rule belongs in the schema rather than in the one service method that
-- erases, so no future code path can get it wrong.
alter table public.route_comments
  drop constraint route_comments_id_route_fkey,
  add constraint route_comments_id_route_fkey
    foreign key (id_route) references public.routes (id) on delete restrict;

alter table public.route_media
  drop constraint route_media_id_route_fkey,
  add constraint route_media_id_route_fkey
    foreign key (id_route) references public.routes (id) on delete restrict;
