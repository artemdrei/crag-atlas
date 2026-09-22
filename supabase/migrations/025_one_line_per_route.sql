-- A route is drawn on one photo. The composite key said otherwise: it allowed
-- the same route to hold a line on every photo of the sector, so the API spent
-- three extra queries per save deleting the copies it had just made possible.
-- With the route as the key, saving a line onto another photo moves the row.
alter table public.route_lines
  drop constraint route_lines_pkey,
  add primary key (id_route);
