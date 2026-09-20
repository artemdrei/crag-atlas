-- Routes carry a community rating, 0..5 as 8a.nu and the climbing guides score
-- them. Optional: most routes in a fresh catalog have never been rated.

alter table public.routes
  add column rating numeric(3, 2)
    check (rating is null or (rating >= 0 and rating <= 5));
