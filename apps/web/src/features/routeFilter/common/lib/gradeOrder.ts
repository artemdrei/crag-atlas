import type { GradeHistogramGroup } from '@crag-atlas/api';

import { gradeKey } from '@web/shared/lib';

// grade_score never reaches the DTO, so position in the histogram is the only
// difficulty order the client has. The types stay apart: a font 7a and a
// french 7a are not the same climb.
export const gradeOrder = (
  groups: GradeHistogramGroup[]
): Record<string, number> => {
  const order: Record<string, number> = {};
  let next = 0;

  for (const group of groups) {
    for (const { grade, scale } of group.grades) {
      const key = gradeKey(grade, scale);

      if (!(key in order)) {
        order[key] = next;
        next += 1;
      }
    }
  }

  return order;
};
