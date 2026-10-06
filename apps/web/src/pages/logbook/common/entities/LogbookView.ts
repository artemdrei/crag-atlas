import type { GradeScale, Tick } from '@crag-atlas/api';

import { ASCENT_TYPES, type AscentType } from '@web/shared/types';

export const DISCIPLINES = ['sport', 'boulder'] as const;

export type Discipline = (typeof DISCIPLINES)[number];

export const TICK_SORTS = ['grade', 'date'] as const;

export type TickSort = (typeof TICK_SORTS)[number];

export const DEFAULT_TICK_SORT: TickSort = 'grade';

export type AscentFilter = AscentType | 'all';

export const ASCENT_FILTERS: AscentFilter[] = ['all', ...ASCENT_TYPES];

export const DEFAULT_ASCENT_FILTER: AscentFilter = 'all';

export interface GradeBar {
  grade: string;
  sourceGrade: string;
  scale: GradeScale;
  score: number;
  total: number;
  counts: Partial<Record<Tick['ascentType'], number>>;
}

export interface GradeGroup extends GradeBar {
  ticks: Tick[];
}

export interface GradeGrouping {
  groups: GradeGroup[];
  ungraded: Tick[];
}
