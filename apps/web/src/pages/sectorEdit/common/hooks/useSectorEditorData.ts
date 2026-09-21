import { useApiGetTopos } from '@web/features/topo';
import { useApiGetRoutes, useApiGetSector } from '@web/pages/sector';

export const useSectorEditorData = (idSector: string) => {
  const {
    sector,
    isLoading: isSectorLoading,
    failure: sectorFailure
  } = useApiGetSector(idSector);
  const {
    routes,
    isLoading: areRoutesLoading,
    failure: routesFailure
  } = useApiGetRoutes(idSector);
  const {
    topos,
    isLoading: areToposLoading,
    failure: toposFailure
  } = useApiGetTopos(idSector);

  return {
    sector,
    routes,
    topos,
    isLoading: isSectorLoading || areRoutesLoading || areToposLoading,
    failure: sectorFailure ?? routesFailure ?? toposFailure
  };
};
