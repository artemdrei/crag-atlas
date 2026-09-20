-- Approach time never made it into the UI and nobody maintains it; the walk-in
-- belongs to the sector description until there is a reason to model it.

alter table public.sectors drop column approach_minutes;
