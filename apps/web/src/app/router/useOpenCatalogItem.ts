import { useNavigate } from 'react-router';

import type { CatalogSource } from '@crag-atlas/analytics';

import { trackCatalogItemOpened } from '@web/shared/lib';

import { buildRegionPath, buildRoutePath, buildSectorPath } from './routes';

export interface CatalogItem {
  name: string;
  idRegion: string;
  idSector?: string | null;
  idRoute?: string | null;
}

export const catalogItemPath = ({
  idRegion,
  idSector,
  idRoute
}: CatalogItem) => {
  if (idSector && idRoute) return buildRoutePath(idRegion, idSector, idRoute);
  if (idSector) return buildSectorPath(idRegion, idSector);

  return buildRegionPath(idRegion);
};

export const useOpenCatalogItem = () => {
  const navigate = useNavigate();

  return (source: CatalogSource, item: CatalogItem, search = '') => {
    trackCatalogItemOpened({ source, ...item });
    navigate({ pathname: catalogItemPath(item), search });
  };
};
