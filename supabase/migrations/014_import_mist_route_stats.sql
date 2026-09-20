-- Ascent and grade-vote counts for the Mist sector, from the 8a.nu reference
-- data in apps/api/data. Matched by name inside the sector, as migration 011.

update public.routes r
set ascents_count = v.ascents_count,
    onsight_count = v.onsight_count,
    votes_soft = v.votes_soft,
    votes_neutral = v.votes_neutral,
    votes_hard = v.votes_hard
from public.sectors s,
  (values
    ('Kit', 64, 40, 1, 54, 2),
    ('Obloga', 67, 10, 3, 32, 0),
    ('Popeljushka', 69, 37, 4, 49, 1),
    ('Potuzhnyj', 63, 3, 7, 36, 4)
  ) as v (
    name, ascents_count, onsight_count, votes_soft, votes_neutral, votes_hard
  )
where r.id_sector = s.id
  and s.name = 'Mist'
  and r.name = v.name;
