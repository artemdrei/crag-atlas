import { matchPath } from 'react-router';

import { buildRegionPath, buildSectorPath, ROUTES } from './routes';

export const parentPathOf = (pathname: string): string | null => {
  const route = matchPath(ROUTES.ROUTE_DETAIL, pathname);
  if (route) {
    const { idRegion = '', idSector = '' } = route.params;

    return buildSectorPath(idRegion, idSector);
  }

  const sector = matchPath(ROUTES.SECTOR, pathname);
  if (sector) return buildRegionPath(sector.params.idRegion ?? '');

  if (matchPath(ROUTES.REGION, pathname)) return ROUTES.INDEX;
  if (matchPath(`${ROUTES.ADMIN}/*`, pathname)) return ROUTES.PROFILE;

  return null;
};
