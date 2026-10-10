import { describe, expect, it } from 'vitest';

import type { ConditionsHour } from '../entities';
import { nearestHour } from './nearestHour';

const hour = (at: string, temperatureC: number | null): ConditionsHour =>
  ({ at, temperatureC }) as ConditionsHour;

const at = (time: string) => new Date(`2026-10-10T${time}:00`);

describe('nearest hour', () => {
  const hours = [hour('08:00', 5), hour('12:00', 15), hour('18:00', 10)];

  it('picks the hour closest to now', () => {
    expect(nearestHour(hours, at('13:10'))?.at).toBe('12:00');
  });

  it('clamps to the edges of the climbing hours', () => {
    expect(nearestHour(hours, at('06:00'))?.at).toBe('08:00');
    expect(nearestHour(hours, at('23:00'))?.at).toBe('18:00');
  });

  it('skips hours without a temperature', () => {
    expect(
      nearestHour([hour('12:00', null), hour('18:00', 10)], at('12:00'))?.at
    ).toBe('18:00');
  });

  it('is empty when nothing is known', () => {
    expect(nearestHour([], at('12:00'))).toBeNull();
  });
});
