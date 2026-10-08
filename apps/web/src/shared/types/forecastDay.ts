import type { WeatherSource } from '@crag-atlas/api';

export interface ForecastDay {
  source: WeatherSource;
  time: string[];
  temperatureC: (number | null)[];
  apparentTemperatureC: (number | null)[];
  dewPointC: (number | null)[];
  humidityPct: (number | null)[];
  windSpeedMs: (number | null)[];
  windGustMs: (number | null)[];
  precipitationMm: (number | null)[];
  cloudCoverPct: (number | null)[];
  weatherCode: (number | null)[];
  sunrise: string | null;
  sunset: string | null;
}
