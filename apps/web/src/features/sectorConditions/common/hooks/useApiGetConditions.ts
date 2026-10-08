import { QUERY_KEYS } from '@web/shared/api';
import type { Coords } from '@web/shared/types';

import { useApiGetConditionsAt } from './useApiGetConditionsAt';

interface Params {
  idSector: string;
  coords?: Coords;
}

// The whole strip in one request: the provider publishes its window at once,
// so stepping to another day is a click and never a fetch.
export const useApiGetConditions = ({ idSector, coords }: Params) =>
  useApiGetConditionsAt({
    path: `/sectors/${idSector}/conditions`,
    queryKey: QUERY_KEYS.sectorConditions(idSector),
    coords
  });
