import { describe, expect, it } from 'vitest';

import { sunDay, sunPosition } from './conditions.sun';

// Kyiv, midsummer noon local time (09:00 UTC).
describe('sun position', () => {
  it('puts the midsummer sun high in the south at noon', () => {
    const { altitude, azimuth } = sunPosition(
      50.45,
      30.52,
      new Date('2026-06-21T09:30:00Z')
    );

    expect(altitude).toBeGreaterThan(60);
    expect(azimuth).toBeGreaterThan(160);
    expect(azimuth).toBeLessThan(200);
  });

  it('puts it below the horizon at local midnight', () => {
    expect(
      sunPosition(50.45, 30.52, new Date('2026-06-21T21:30:00Z')).altitude
    ).toBeLessThan(0);
  });
});

const KYIV = {
  lat: 50.45,
  lng: 30.52,
  utcOffsetSeconds: 3 * 3600,
  profile: null
};

describe('sun and shade over a day', () => {
  it('runs from sunrise to sunset on an open horizon', () => {
    const day = sunDay({ ...KYIV, date: '2026-06-21', aspectDeg: null });

    expect(day.sunriseAt).not.toBeNull();
    expect(day.sunsetAt).not.toBeNull();
    expect(day.intervals).toHaveLength(1);
    expect(day.intervals[0]?.fromAt).toBe(day.sunriseAt);
    expect(day.intervals[0]?.untilAt).toBe(day.sunsetAt);
  });

  it('keeps a north face out of the sun for most of the day', () => {
    const north = sunDay({ ...KYIV, date: '2026-06-21', aspectDeg: 0 });
    const south = sunDay({ ...KYIV, date: '2026-06-21', aspectDeg: 180 });

    const litHours = (day: typeof north) =>
      day.isSunByHour.filter(Boolean).length;

    expect(litHours(north)).toBeLessThan(litHours(south));
    expect(south.isSunByHour[12]).toBe(true);
    expect(north.isSunByHour[12]).toBe(false);
  });

  it('shuts a sector in behind a ridge that fills the southern sky', () => {
    const walled = sunDay({
      ...KYIV,
      date: '2026-06-21',
      aspectDeg: null,
      profile: Array.from({ length: 360 }, () => 850)
    });

    expect(walled.intervals).toHaveLength(0);
    expect(walled.sunriseAt).not.toBeNull();
  });

  it('answers in minutes, not in whole hours', () => {
    const day = sunDay({ ...KYIV, date: '2026-03-21', aspectDeg: null });

    expect(day.sunriseAt).toMatch(/^\d{2}:\d{2}$/);
    expect(day.sunriseAt?.endsWith(':00')).toBe(false);
  });
});
