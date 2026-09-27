import { describe, expect, it } from 'vitest';

import type { Tick } from '../entities';
import { tickDiscipline } from './tickDiscipline';

const tick = (routeGradeScale: Tick['routeGradeScale']): Tick =>
  ({ routeGradeScale }) as Tick;

describe('tickDiscipline', () => {
  it('reads a boulder scale as bouldering', () => {
    expect(tickDiscipline(tick('font'))).toBe('boulder');
    expect(tickDiscipline(tick('vscale'))).toBe('boulder');
  });

  it('reads a route scale as sport', () => {
    expect(tickDiscipline(tick('french'))).toBe('sport');
    expect(tickDiscipline(tick('yds'))).toBe('sport');
  });

  it('falls back to sport when the route is gone', () => {
    expect(tickDiscipline(tick(null))).toBe('sport');
  });
});
