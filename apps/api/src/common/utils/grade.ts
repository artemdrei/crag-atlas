import type { GradeScalesTypes } from '@openbeta/sandbag';
import { getScale, getScore, getScoreForSort } from '@openbeta/sandbag';

/** Scales a roped route can be graded in; they all convert into each other. */
export const ROUTE_GRADE_SCALES = [
  'french',
  'yds',
  'uiaa',
  'saxon',
  'ewbank',
  'norwegian',
  'brazilian_crux'
] as const;

/** Bouldering scales. A boulder grade never converts into a route grade. */
export const BOULDER_GRADE_SCALES = ['font', 'vscale'] as const;

export const GRADE_SCALES = [
  ...ROUTE_GRADE_SCALES,
  ...BOULDER_GRADE_SCALES
] as const;

export type RouteGradeScale = (typeof ROUTE_GRADE_SCALES)[number];
export type BoulderGradeScale = (typeof BOULDER_GRADE_SCALES)[number];
export type GradeScale = (typeof GRADE_SCALES)[number];
export const DEFAULT_ROUTE_GRADE_SCALE: RouteGradeScale = 'french';
export const DEFAULT_BOULDER_GRADE_SCALE: BoulderGradeScale = 'vscale';

export const isGradeScale = (value: unknown): value is GradeScale =>
  GRADE_SCALES.includes(value as GradeScale);

export const isRouteGradeScale = (value: unknown): value is RouteGradeScale =>
  ROUTE_GRADE_SCALES.includes(value as RouteGradeScale);

export const isBoulderGradeScale = (
  value: unknown
): value is BoulderGradeScale =>
  BOULDER_GRADE_SCALES.includes(value as BoulderGradeScale);

export const isValidGrade = (grade: string, scale: GradeScale): boolean =>
  getScale(scale as GradeScalesTypes)?.isType(grade) ?? false;

/**
 * The sortable key stored next to the grade. `getScoreForSort` is the only
 * public accessor that returns a single number; a scale's own `getScore`
 * returns the range a grade spans.
 */
export const gradeScore = (grade: string, scale: GradeScale): number =>
  getScoreForSort(grade, scale as GradeScalesTypes);

/** The span a grade covers, used to build an inclusive filter range. */
export const gradeScoreRange = (
  grade: string,
  scale: GradeScale
): [number, number] => {
  const score = getScore(grade, scale as GradeScalesTypes);

  return typeof score === 'number' ? [score, score] : score;
};
