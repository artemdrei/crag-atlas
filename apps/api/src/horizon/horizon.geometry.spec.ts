import { describe, expect, it } from 'vitest';

import {
  aspectFromRing,
  azimuthDifference,
  destination,
  elevationAngle,
  horizonAt,
  horizonSamples,
  toProfile
} from './horizon.geometry';

const KYIV = { lat: 50.45, lng: 30.52 };

describe('destination', () => {
  it('walks north and east by the distance asked for', () => {
    const north = destination(KYIV, { azimuth: 0, distanceM: 1000 });
    const east = destination(KYIV, { azimuth: 90, distanceM: 1000 });

    expect(north.lat).toBeGreaterThan(KYIV.lat);
    expect(north.lng).toBeCloseTo(KYIV.lng, 4);
    expect(east.lng).toBeGreaterThan(KYIV.lng);
    expect(east.lat).toBeCloseTo(KYIV.lat, 4);
  });
});

describe('elevation angle', () => {
  it('reads a hundred metres at a hundred metres as forty-five degrees', () => {
    expect(elevationAngle(0, 100, 100)).toBeCloseTo(45, 1);
  });

  it('lets the planet curve away over twenty kilometres', () => {
    expect(elevationAngle(0, 0, 20_000)).toBeLessThan(0);
  });
});

describe('profile', () => {
  it('stores one entry per degree in tenths of a degree', () => {
    const profile = toProfile(Array.from({ length: 180 }, () => 12.34));

    expect(profile).toHaveLength(360);
    expect(profile[0]).toBe(123);
  });

  it('never dips below the flat horizon', () => {
    expect(toProfile(Array.from({ length: 180 }, () => -8))[0]).toBe(0);
  });

  it('interpolates between the degrees it stores', () => {
    const profile = [...Array.from({ length: 360 }, () => 0)];

    profile[10] = 100;
    profile[11] = 200;

    expect(horizonAt(profile, 10.5)).toBeCloseTo(15, 5);
  });
});

describe('aspect', () => {
  const ring = (heights: number[]) => heights;

  it('points where the ground falls away', () => {
    // Low to the east, high to the west.
    expect(
      aspectFromRing(500, ring([500, 480, 470, 480, 500, 520, 530, 520]))
    ).toBe(90);
  });

  it('reads the slope through a single noisy cell', () => {
    const noisy = ring([500, 480, 470, 480, 500, 520, 460, 520]);

    expect(aspectFromRing(500, noisy)).toBeGreaterThan(30);
    expect(aspectFromRing(500, noisy)).toBeLessThan(150);
  });

  it('refuses to guess on flat ground', () => {
    expect(
      aspectFromRing(
        500,
        Array.from({ length: 8 }, () => 499)
      )
    ).toBeNull();
  });
});

describe('azimuth difference', () => {
  it('measures the short way round', () => {
    expect(azimuthDifference(350, 10)).toBe(20);
    expect(azimuthDifference(10, 350)).toBe(20);
    expect(azimuthDifference(0, 180)).toBe(180);
  });
});

describe('sampling', () => {
  // The provider counts coordinates, not requests, and allows six hundred a
  // minute. A sector that does not fit in one minute cannot be built on a
  // save.
  it('keeps a sector inside one minute of the provider budget', () => {
    expect(horizonSamples().length + 1).toBeLessThanOrEqual(600);
  });
});
