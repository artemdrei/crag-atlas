import { afterEach, describe, expect, it, vi } from 'vitest';

import { getForecastDay, getForecastWindow } from './openMeteo';

const point = { lat: 48.68, lng: 26.56 };

const answer = (status: number, body: unknown) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status }));

describe('openMeteo', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('maps the provider answer to the neutral forecast', async () => {
    vi.stubGlobal(
      'fetch',
      answer(200, {
        utc_offset_seconds: 10800,
        hourly: {
          time: ['2026-10-08T00:00'],
          temperature_2m: [12],
          relative_humidity_2m: [80],
          precipitation: [0.2],
          weather_code: [61],
          wind_speed_10m: [3]
        }
      })
    );

    await expect(getForecastWindow(point)).resolves.toEqual({
      utcOffsetSeconds: 10800,
      time: ['2026-10-08T00:00'],
      temperatureC: [12],
      humidityPct: [80],
      precipitationMm: [0.2],
      weatherCode: [61],
      windSpeedMs: [3]
    });
  });

  it('turns a refused request into a weather failure', async () => {
    vi.stubGlobal(
      'fetch',
      answer(429, { error: true, reason: 'Daily API request limit exceeded' })
    );

    await expect(getForecastWindow(point)).rejects.toMatchObject({
      code: 'WEATHER_FETCH_FAILED'
    });
  });

  it('refuses a day too far ahead without asking the provider', async () => {
    const fetch = vi.fn();

    vi.stubGlobal('fetch', fetch);

    await expect(getForecastDay(point, '2999-01-01')).rejects.toMatchObject({
      code: 'WEATHER_DATE_UNAVAILABLE'
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});
