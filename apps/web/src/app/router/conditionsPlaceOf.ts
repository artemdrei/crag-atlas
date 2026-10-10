import { matchPath } from 'react-router';

import type { ConditionsPlace } from '@web/features/sectorConditions';

import { idRegionOf } from './idRegionOf';
import { ROUTES } from './routes';

export const conditionsPlaceOf = (pathname: string): ConditionsPlace | null => {
  const idSector = [ROUTES.ROUTE_DETAIL, ROUTES.SECTOR]
    .map((route) => matchPath(route, pathname)?.params.idSector)
    .find((id): id is string => !!id);
  if (idSector) return { list: 'sector', idSector };

  const idRegion = idRegionOf(pathname);

  return idRegion ? { list: 'region', idRegion } : null;
};
