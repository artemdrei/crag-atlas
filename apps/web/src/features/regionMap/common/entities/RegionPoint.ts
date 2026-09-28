import type { Region } from '@crag-atlas/api';

import type { Coords } from '@web/shared/types';

export interface MappedRegion {
  region: Region;
  point: Coords;
}
