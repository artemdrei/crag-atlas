import { describe, expect, it } from 'vitest';

import { weatherKindOf } from './weatherKind';

describe('weather kind', () => {
  it('reads the sky from the WMO code', () => {
    expect(weatherKindOf(0)).toBe('clear');
    expect(weatherKindOf(2)).toBe('partlyCloudy');
    expect(weatherKindOf(3)).toBe('cloudy');
    expect(weatherKindOf(48)).toBe('fog');
    expect(weatherKindOf(53)).toBe('drizzle');
    expect(weatherKindOf(81)).toBe('rain');
    expect(weatherKindOf(86)).toBe('snow');
    expect(weatherKindOf(95)).toBe('thunder');
  });

  it('names nothing for a missing or unknown code', () => {
    expect(weatherKindOf(null)).toBeNull();
    expect(weatherKindOf(20)).toBeNull();
  });
});
