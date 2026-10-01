import type { TickWeatherDto } from './weather.types';

const ASSUMED_HOUR = '14:00';

export interface TickWeatherRow {
  id_tick: string;
  observed_at: string;
  lat: number | null;
  lng: number | null;
  temperature_c: number | null;
  apparent_temperature_c: number | null;
  dew_point_c: number | null;
  humidity_pct: number | null;
  wind_speed_ms: number | null;
  wind_gust_ms: number | null;
  precipitation_mm: number | null;
  precipitation_24h_mm: number | null;
  cloud_cover_pct: number | null;
  weather_code: number | null;
  sunrise: string | null;
  sunset: string | null;
  is_manual: boolean;
}

export interface WeatherEntry {
  idTick: string;
  at: string;
  weather: TickWeatherDto;
}

// Floored like the provider's hourly series, and like `observedHour` on the
// web, or a saved reading never matches the hour on screen. An ascent logged
// before the column existed has none: early afternoon is a guess.
export const observedHour = (date: string, time: string | null): string =>
  `${date}T${(time ?? ASSUMED_HOUR).slice(0, 2)}:00`;

export const toWeatherDto = (row: TickWeatherRow): TickWeatherDto => ({
  observedAt: row.observed_at.slice(0, 16),
  lat: row.lat,
  lng: row.lng,
  temperatureC: row.temperature_c,
  apparentTemperatureC: row.apparent_temperature_c,
  dewPointC: row.dew_point_c,
  humidityPct: row.humidity_pct,
  windSpeedMs: row.wind_speed_ms,
  windGustMs: row.wind_gust_ms,
  precipitationMm: row.precipitation_mm,
  precipitation24hMm: row.precipitation_24h_mm,
  cloudCoverPct: row.cloud_cover_pct,
  weatherCode: row.weather_code,
  sunrise: row.sunrise?.slice(0, 5) ?? null,
  sunset: row.sunset?.slice(0, 5) ?? null,
  isManual: row.is_manual
});

export const toWeatherColumns = ({ idTick, at, weather }: WeatherEntry) => ({
  id_tick: idTick,
  observed_at: at,
  lat: weather.lat ?? null,
  lng: weather.lng ?? null,
  temperature_c: weather.temperatureC ?? null,
  apparent_temperature_c: weather.apparentTemperatureC ?? null,
  dew_point_c: weather.dewPointC ?? null,
  humidity_pct: weather.humidityPct ?? null,
  wind_speed_ms: weather.windSpeedMs ?? null,
  wind_gust_ms: weather.windGustMs ?? null,
  precipitation_mm: weather.precipitationMm ?? null,
  precipitation_24h_mm: weather.precipitation24hMm ?? null,
  cloud_cover_pct: weather.cloudCoverPct ?? null,
  weather_code: weather.weatherCode ?? null,
  sunrise: weather.sunrise || null,
  sunset: weather.sunset || null,
  is_manual: weather.isManual ?? false
});
