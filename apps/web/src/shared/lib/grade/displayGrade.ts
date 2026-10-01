import type { GradeScale } from '@crag-atlas/api';
import { convertGrade, getScale } from '@openbeta/sandbag';

// Route and boulder scales never convert into each other, so anything outside
// the reader's family stays as its guidebook wrote it.
export const displayGrade = (
  grade: string,
  scale: GradeScale,
  preferred?: GradeScale | null
): string => {
  if (!preferred || preferred === scale) {
    return grade;
  }

  if (
    getScale(scale)?.conversionGroup !== getScale(preferred)?.conversionGroup
  ) {
    return grade;
  }

  return convertGrade(grade, scale, preferred) || grade;
};
