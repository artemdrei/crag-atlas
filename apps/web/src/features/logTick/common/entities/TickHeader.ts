import type { GradeScale } from '@crag-atlas/api';

export interface TickHeader {
  routeName?: string | null;
  routeGrade?: string | null;
  routeGradeScale?: GradeScale | null;
  place?: string | null;
}
