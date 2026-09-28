import type { Sector } from '@crag-atlas/api';

import type { Coords } from '@web/shared/types';

export interface MappedSector {
  sector: Sector;
  point: Coords;
  toneIndex: number;
}
