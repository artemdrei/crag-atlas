import { useMemo } from 'react';

import { findTopoOfRoute, orderRoutes } from '../lib';
import { useApiGetTopos } from './useApiGetTopos';

export const useRouteTopo = (idSector: string, idRoute: string) => {
  const { topos, isLoading, failure } = useApiGetTopos(idSector);

  const topo = useMemo(() => findTopoOfRoute(topos, idRoute), [topos, idRoute]);

  const lines = useMemo(() => {
    const line = topo?.lines.find((item) => item.idRoute === idRoute);

    return line ? [line] : [];
  }, [topo, idRoute]);

  const numberOf = useMemo(() => orderRoutes(topos), [topos]);

  // Photos are named by position, so the caller needs to know which this is.
  const photoIndex = topo ? topos.indexOf(topo) : -1;

  return { topo, photoIndex, lines, numberOf, isLoading, failure };
};
