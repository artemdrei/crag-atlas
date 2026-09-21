import { describe, expect, it } from 'vitest';

import { formatBytes, savedPercent } from './formatBytes';

describe('formatBytes', () => {
  it('keeps anything under a megabyte in kilobytes', () => {
    expect(formatBytes(380 * 1024, 'en')).toBe('380 kB');
  });

  it('switches to megabytes at a megabyte', () => {
    expect(formatBytes(4.2 * 1024 * 1024, 'en')).toBe('4.2 MB');
  });

  it('drops the fraction once the number is big enough to carry itself', () => {
    expect(formatBytes(12.7 * 1024 * 1024, 'en')).toBe('13 MB');
  });

  it('takes the unit from the locale', () => {
    expect(formatBytes(4.2 * 1024 * 1024, 'uk')).toBe('4,2 МБ');
  });
});

describe('savedPercent', () => {
  it('reports the share of the original that is gone', () => {
    expect(savedPercent(1000, 100)).toBe(90);
  });

  it('reports nothing saved when the file grew', () => {
    expect(savedPercent(100, 150)).toBe(-50);
  });

  it('survives an empty original', () => {
    expect(savedPercent(0, 0)).toBe(0);
  });
});
