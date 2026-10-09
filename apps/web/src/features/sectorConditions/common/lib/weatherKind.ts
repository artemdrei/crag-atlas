export type WeatherKind =
  | 'clear'
  | 'partlyCloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunder';

export type PrecipitationKind = 'dry' | 'drizzle' | 'rain' | 'snow';

const DRIZZLE_MM = 0.1;
const RAIN_MM = 0.5;

const isSnowCode = (code: number | null): boolean =>
  code != null && ((code >= 71 && code <= 77) || code === 85 || code === 86);

// Snow melts to water in the gauge, so the code decides what fell and the
// millimetres only how much.
export const precipitationKindOf = (
  code: number | null,
  precipitationMm: number | null
): PrecipitationKind => {
  const falling = precipitationMm ?? 0;

  if (isSnowCode(code)) return 'snow';
  if (falling >= RAIN_MM) return 'rain';
  if (falling >= DRIZZLE_MM) return 'drizzle';

  return 'dry';
};

// WMO 4677 codes as Open-Meteo publishes them. The code describes the sky
// and may say "overcast" through a drizzle, so what falls wins over it.
export const weatherKindOf = (
  code: number | null,
  precipitationMm: number | null = null
): WeatherKind | null => {
  const falling = precipitationKindOf(code, precipitationMm);

  if (code != null && code >= 95) return 'thunder';
  if (falling === 'snow') return 'snow';
  if (falling === 'rain') return 'rain';
  if (falling === 'drizzle') return 'drizzle';
  if (code == null) return null;
  if (code === 0) return 'clear';
  if (code <= 2) return 'partlyCloudy';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';

  return null;
};
