-- The rock type was free text, so the conditions score could not read it.
-- It becomes one of a short list the editor picks from, and anything the
-- list does not name becomes `other` rather than blocking the constraint.
update public.regions
set rock_type = case lower(trim(rock_type))
  when 'limestone' then 'limestone'
  when 'dolomite' then 'limestone'
  when 'sandstone' then 'sandstone'
  when 'granite' then 'granite'
  when 'gneiss' then 'gneiss'
  when 'basalt' then 'basalt'
  when 'conglomerate' then 'conglomerate'
  else 'other'
end;

alter table public.regions
  alter column rock_type set default 'other',
  add constraint regions_rock_type_check
    check (rock_type in (
      'limestone', 'sandstone', 'granite', 'gneiss', 'basalt',
      'conglomerate', 'other'
    ));
