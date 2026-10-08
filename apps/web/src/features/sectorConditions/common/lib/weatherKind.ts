export type WeatherKind =
  | 'clear'
  | 'partlyCloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunder';

const DRIZZLE_MM = 0.1;
const RAIN_MM = 0.5;

// WMO 4677 codes as Open-Meteo publishes them. The code describes the sky
// and may say "overcast" through a drizzle, so what falls wins over it.
export const weatherKindOf = (
  code: number | null,
  precipitationMm: number | null = null
): WeatherKind | null => {
  const falling = precipitationMm ?? 0;

  if (falling >= RAIN_MM)
    return code != null && code >= 95 ? 'thunder' : 'rain';
  if (falling >= DRIZZLE_MM) return 'drizzle';
  if (code == null) return null;
  if (code === 0) return 'clear';
  if (code <= 2) return 'partlyCloudy';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'thunder';

  return null;
};
