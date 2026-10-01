import type {
  BoulderGradeScale,
  GradeScale,
  RouteGradeScale
} from '@crag-atlas/api';
import { convertGrade, getScale } from '@openbeta/sandbag';

// Typed against the contract, so a scale added or dropped in the API stops the
// build here instead of silently missing from the pickers.
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

// Proper nouns, so they are never translated.
export const gradeScaleName = (scale: GradeScale): string =>
  getScale(scale)?.displayName ?? scale;

// One climb in every system: 6a converts cleanly into all of them.
const EXAMPLE_GRADE: Record<string, { grade: string; scale: GradeScale }> = {
  free: { grade: '6a', scale: 'french' },
  bouldering: { grade: '6a', scale: 'font' }
};

export const gradeScalesForType = (
  type: 'sport' | 'boulder'
): readonly GradeScale[] =>
  type === 'boulder' ? BOULDER_GRADE_SCALES : ROUTE_GRADE_SCALES;

export const defaultGradeScale = (type: 'sport' | 'boulder'): GradeScale =>
  type === 'boulder' ? 'vscale' : 'french';

export const gradeScaleExample = (scale: GradeScale): string => {
  const group = getScale(scale)?.conversionGroup;
  const example = group ? EXAMPLE_GRADE[group] : undefined;

  if (!example) {
    return '';
  }

  return convertGrade(example.grade, example.scale, scale);
};

export const gradeOptions = (scale: GradeScale): string[] =>
  getScale(scale)?.grades ?? [];
