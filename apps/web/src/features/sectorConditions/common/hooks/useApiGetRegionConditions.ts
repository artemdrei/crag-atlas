import { QUERY_KEYS } from '@web/shared/api';
import type { Coords } from '@web/shared/types';

import { useApiGetConditionsAt } from './useApiGetConditionsAt';

interface Params {
  idRegion: string;
  coords?: Coords;
}

// The region's own point, so the card answers whether it is worth driving
// out at all. Sun and shade belong to a wall, and a region has none.
export const useApiGetRegionConditions = ({ idRegion, coords }: Params) =>
  useApiGetConditionsAt({
    path: `/regions/${idRegion}/conditions`,
    queryKey: QUERY_KEYS.regionConditions(idRegion),
    coords
  });
