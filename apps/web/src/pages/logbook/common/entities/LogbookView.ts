import type { GradeScale, Tick } from '@crag-atlas/api';

export const DISCIPLINES = ['sport', 'boulder'] as const;

export type Discipline = (typeof DISCIPLINES)[number];

export const TICK_SORTS = ['grade', 'date'] as const;

export type TickSort = (typeof TICK_SORTS)[number];

export type AscentFilter = Tick['ascentType'] | 'all';

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
