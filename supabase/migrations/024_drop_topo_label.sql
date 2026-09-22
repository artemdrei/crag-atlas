-- Photos are named by where they sit in the sector, computed when the page
-- renders. The column held whatever the uploader's file was called, nothing
-- reads it any more, and a stored name would lie as soon as photos are
-- reordered.
alter table public.topos
  drop column label;
