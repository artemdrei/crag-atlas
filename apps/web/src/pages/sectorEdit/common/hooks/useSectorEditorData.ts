import { useApiGetTopos } from '@web/features/topo';
import { useApiGetRoutes, useApiGetSector } from '@web/pages/sector';

export const useSectorEditorData = (
  idSector: string,
  isArchiveShown = false
) => {
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
  const { routes: archivedRoutes } = useApiGetRoutes(
    idSector,
    true,
    isArchiveShown
  );
  const {
    topos,
    isLoading: areToposLoading,
    failure: toposFailure
  } = useApiGetTopos(idSector);

  return {
    sector,
    routes,
    archivedRoutes,
    topos,
    isLoading: isSectorLoading || areRoutesLoading || areToposLoading,
    failure: sectorFailure ?? routesFailure ?? toposFailure
  };
};
