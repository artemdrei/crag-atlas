import { matchPath } from 'react-router';

import { ROUTES } from './routes';

export const idRegionOf = (pathname: string): string | null =>
  [ROUTES.ROUTE_DETAIL, ROUTES.SECTOR, ROUTES.REGION]
    .map((route) => matchPath(route, pathname)?.params.idRegion)
    .find((idRegion): idRegion is string => !!idRegion) ?? null;
