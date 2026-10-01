import type { GradeScale } from '@crag-atlas/api';
import { getScale } from '@openbeta/sandbag';

import type { Discipline, Tick } from '../entities';

export const scaleDiscipline = (scale?: GradeScale | null): Discipline =>
  scale && getScale(scale)?.conversionGroup === 'bouldering'
    ? 'boulder'
    : 'sport';

// A tick whose route is gone carries no scale and follows the catalog
// default, which is a route scale.
export const tickDiscipline = (tick: Tick): Discipline =>
  scaleDiscipline(tick.routeGradeScale);
