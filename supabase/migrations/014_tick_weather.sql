-- Weather belongs to an hour, not to a day, so the tick carries a time beside
-- its date. Nullable: every ascent logged before this column existed has a
-- date and nothing more, and the feed cursor still keys on `climbed_at`.
alter table public.ticks add column climbed_at_time time;

-- The conditions of one ascent, kept in their own row rather than as fifteen
-- nullable columns on the tick: "no weather recorded" is simply no row, and
-- filling the old logbook in is a plain insert.
--
-- Every value is stored in SI — °C, %, m/s, mm — whatever a reader is shown.
create table public.tick_weather (
  id_tick uuid primary key references public.ticks (id) on delete cascade,
  -- Local wall clock at the crag, deliberately without a zone: it is the hour
  -- the climber was there, matched against the hour the provider answered
  -- for. Reinterpreting it in the server's zone would shift every reading.
  observed_at timestamp not null,
  -- The point the reading was fetched for — the sector's, usually. Null when
  -- the sector has no coordinates and the numbers were written by hand.
  lat double precision,
  lng double precision,
  constraint tick_weather_point_complete check ((lat is null) = (lng is null)),
  constraint tick_weather_lat_range check (lat is null or lat between -90 and 90),
  constraint tick_weather_lng_range check (lng is null or lng between -180 and 180),
  temperature_c real,
  apparent_temperature_c real,
  dew_point_c real,
  humidity_pct smallint
    check (humidity_pct is null or humidity_pct between 0 and 100),
  wind_speed_ms real check (wind_speed_ms is null or wind_speed_ms >= 0),
  wind_gust_ms real check (wind_gust_ms is null or wind_gust_ms >= 0),
  precipitation_mm real
    check (precipitation_mm is null or precipitation_mm >= 0),
  -- What fell in the twenty-four hours up to `observed_at`. A dry hour on a
  -- wall that took 8 mm overnight is still a wet wall.
  precipitation_24h_mm real
    check (precipitation_24h_mm is null or precipitation_24h_mm >= 0),
  cloud_cover_pct smallint
    check (cloud_cover_pct is null or cloud_cover_pct between 0 and 100),
  weather_code smallint,
  sunrise time,
  sunset time,
  -- One flag for the row, not one per field: keeping a per-field original
  -- would mean storing the provider's answer beside the edited one forever.
  is_manual boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tick_weather_set_updated_at
  before update on public.tick_weather
  for each row execute function public.set_updated_at();

alter table public.tick_weather enable row level security;

create policy tick_weather_select_public on public.tick_weather
  for select using (true);

-- `id_tick` arrives from the client, so ownership is checked through the tick
-- it points at — the row itself carries no user to compare against.
create policy tick_weather_write_own on public.tick_weather
  for all
  using (
    exists (
      select 1 from public.ticks
      where ticks.id = tick_weather.id_tick and ticks.id_user = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.ticks
      where ticks.id = tick_weather.id_tick and ticks.id_user = auth.uid()
    )
  );
