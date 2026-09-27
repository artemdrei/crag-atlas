import type { GradeScale } from '@crag-atlas/api';
import { convertGrade } from '@openbeta/sandbag';
import { describe, expect, it } from 'vitest';

import type { Tick } from '../entities';
import { groupTicksByGrade } from './groupTicksByGrade';

const tick = (
  id: string,
  routeGrade: string | null,
  routeGradeScale: Tick['routeGradeScale'],
  ascentType: Tick['ascentType'] = 'redpoint'
): Tick => ({ id, routeGrade, routeGradeScale, ascentType }) as Tick;

const asFrench = (grade: string, scale: GradeScale) =>
  scale === 'french' ? grade : convertGrade(grade, scale, 'french') || grade;

describe('groupTicksByGrade', () => {
  it('orders grades from hardest to easiest', () => {
    const { groups } = groupTicksByGrade(
      [
        tick('a', '6a', 'french'),
        tick('b', '7a', 'french'),
        tick('c', '6c+', 'french')
      ],
      asFrench
    );

    expect(groups.map((group) => group.grade)).toEqual(['7a', '6c+', '6a']);
  });

  it('counts a grade by ascent type', () => {
    const { groups } = groupTicksByGrade(
      [
        tick('a', '6a', 'french', 'onsight'),
        tick('b', '6a', 'french', 'flash'),
        tick('c', '6a', 'french', 'flash')
      ],
      asFrench
    );

    expect(groups).toHaveLength(1);
    expect(groups[0]?.ticks).toHaveLength(3);
    expect(groups[0]?.counts).toEqual({ onsight: 1, flash: 2 });
  });

  it('merges scales that mean the same grade', () => {
    const { groups } = groupTicksByGrade(
      [tick('a', '6a+', 'french'), tick('b', '5.10b', 'yds')],
      asFrench
    );

    expect(groups).toHaveLength(1);
    expect(groups[0]?.ticks).toHaveLength(2);
  });

  it('sinks a grade it cannot read below the ones it can', () => {
    const { groups } = groupTicksByGrade(
      [tick('a', 'project', 'french'), tick('b', '5c', 'french')],
      asFrench
    );

    expect(groups.map((group) => group.grade)).toEqual(['5c', 'project']);
  });

  it('keeps a tick whose route is gone out of the grades', () => {
    const { groups, ungraded } = groupTicksByGrade(
      [tick('a', null, null), tick('b', '6a', 'french')],
      asFrench
    );

    expect(groups).toHaveLength(1);
    expect(ungraded.map((item) => item.id)).toEqual(['a']);
  });
});
