import { ValidationException } from '../common/exceptions/app.exception';
import type { ForecastDto } from './conditions.types';

// The day before and sixteen ahead, with room for a provider that publishes
// a little more.
const MAX_HOURS = 24 * 18;

const AT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const SERIES = [
  'temperatureC',
  'humidityPct',
  'precipitationMm',
  'weatherCode',
  'windSpeedMs'
] as const satisfies readonly (keyof ForecastDto)[];

// A series of the wrong length would score an hour against another hour's
// rain.
export const assertForecast = (forecast: ForecastDto): ForecastDto => {
  const time: unknown = forecast?.time;

  const isTimeValid =
    Array.isArray(time) &&
    time.length > 0 &&
    time.length <= MAX_HOURS &&
    time.every((at) => typeof at === 'string' && AT_PATTERN.test(at));

  const isValid =
    isTimeValid &&
    Number.isFinite(forecast.utcOffsetSeconds) &&
    SERIES.every((name) => {
      const series: unknown = forecast[name];

      return (
        Array.isArray(series) &&
        series.length === time.length &&
        series.every(
          (value) =>
            value === null ||
            (typeof value === 'number' && Number.isFinite(value))
        )
      );
    });

  if (!isValid) {
    throw new ValidationException(
      'The forecast does not have the expected series',
      'FORECAST_INVALID'
    );
  }

  return forecast;
};
