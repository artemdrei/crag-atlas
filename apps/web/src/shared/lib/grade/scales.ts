import type {
  BoulderGradeScale,
  GradeScale,
  RouteGradeScale
} from '@crag-atlas/api';
import { convertGrade, getScale } from '@openbeta/sandbag';

// Typed against the contract, so a scale added or dropped in the API stops
// the build here instead of silently missing from the pickers.
export const ROUTE_GRADE_SCALES: RouteGradeScale[] = [
  'french',
  'yds',
  'uiaa',
  'saxon',
  'ewbank',
  'norwegian',
  'brazilian_crux'
];

export const BOULDER_GRADE_SCALES: BoulderGradeScale[] = ['font', 'vscale'];

/** The scale's own name — proper nouns, so they are never translated. */
export const gradeScaleName = (scale: GradeScale): string =>
  getScale(scale)?.displayName ?? scale;

// One climb, written in every system: the names alone say nothing about what
// a grade looks like. 6a converts cleanly into all of them, without a slash.
const EXAMPLE_GRADE: Record<string, { grade: string; scale: GradeScale }> = {
  free: { grade: '6a', scale: 'french' },
  bouldering: { grade: '6a', scale: 'font' }
};

/** A sport route is never graded on a boulder scale, and the other way round. */
export const gradeScalesForType = (
  type: 'sport' | 'boulder'
): readonly GradeScale[] =>
  type === 'boulder' ? BOULDER_GRADE_SCALES : ROUTE_GRADE_SCALES;

/** What a route of this type starts out graded in. */
export const defaultGradeScale = (type: 'sport' | 'boulder'): GradeScale =>
  type === 'boulder' ? 'vscale' : 'french';

/** A sample grade in this scale, to show next to its name. */
export const gradeScaleExample = (scale: GradeScale): string => {
  const group = getScale(scale)?.conversionGroup;
  const example = group ? EXAMPLE_GRADE[group] : undefined;

  if (!example) {
    return '';
  }

  return convertGrade(example.grade, example.scale, scale);
};

/** Every grade the scale defines, in order: the options of a grade picker. */
export const gradeOptions = (scale: GradeScale): string[] =>
  getScale(scale)?.grades ?? [];
