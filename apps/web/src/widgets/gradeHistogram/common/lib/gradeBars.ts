import type { GradeCount, GradeScale } from '@crag-atlas/api';

import type { GradeTone } from '@web/shared/theme/palette';
import { resolveGradeTone } from '@web/shared/theme/palette';

export interface GradeBar {
  key: string;
  label: string;
  tone: GradeTone;
  count: number;
}

/** The pair, not the label: 6a French and 6a Font are different grades. */
export const gradeKey = (grade: string, scale: GradeScale): string =>
  `${scale}|${grade}`;

export const toGradeBars = (
  grades: GradeCount[],
  toLabel: (grade: string, scale: GradeScale) => string
): GradeBar[] =>
  grades.map(({ grade, scale, count }) => ({
    key: gradeKey(grade, scale),
    label: toLabel(grade, scale),
    tone: resolveGradeTone(grade, scale),
    count
  }));
