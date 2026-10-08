-- Which provider a reading came from, so a switch to another one never
-- credits it with readings it did not make. Null when the numbers were
-- written by hand at a sector without a point.
alter table public.tick_weather
  add column source text,
  add constraint tick_weather_source_known
    check (source is null or source in ('open-meteo'));

-- Every reading fetched so far came from Open-Meteo, and only a fetched one
-- carries the point it was read at.
update public.tick_weather
  set source = 'open-meteo'
  where lat is not null;
