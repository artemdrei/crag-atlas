
-- Replacing a photo may keep its lines only if the proportions match —
-- fractional coordinates mean nothing otherwise. The API has no image decoder,
-- so the dimensions travel with the upload and live here. Nullable: the rows
-- imported before the editor existed have none.
alter table public.topos
  add column width integer check (width is null or width > 0),
  add column height integer check (height is null or height > 0);

alter table public.route_lines
  -- [[x, y], …] in the same 0..1 fractions as `points`. Bolts are always
  -- written as a complete set together with the line and nothing references an
  -- individual bolt, so a column beats a table here.
  add column bolts jsonb not null default '[]'::jsonb,
  -- A route has one top station per photo, so a single [x, y] or nothing,
  -- which makes that rule structural instead of a constraint.
  add column anchor jsonb,
  add column label_offset_x double precision not null default 0
    check (label_offset_x between -1 and 1),
  add column label_offset_y double precision not null default 0
    check (label_offset_y between -1 and 1);
