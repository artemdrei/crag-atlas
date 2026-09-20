-- Real numbers for the routes of the Mist sector, taken from the reference
-- data in apps/api/data (8a.nu ratings, climbing-guide bolt counts). Matched by
-- name inside the sector, so nothing outside Mist is touched.

update public.routes r
set rating = v.rating,
    bolts_count = v.bolts_count
from public.sectors s,
  (values
    ('Kit', 4.56, 9),
    ('Obloga', 4.69, 9),
    ('Popeljushka', 4.23, 5),
    ('Potuzhnyj', 4.00, 5)
  ) as v (name, rating, bolts_count)
where r.id_sector = s.id
  and s.name = 'Mist'
  and r.name = v.name;
