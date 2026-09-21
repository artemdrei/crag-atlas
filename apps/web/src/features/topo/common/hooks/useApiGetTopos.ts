import type { Topo } from '@crag-atlas/api';

import { apiGet, QUERY_KEYS, useApiQuery } from '@web/shared/api';

import { normalizeLineDirection } from '../lib';

export const useApiGetTopos = (idSector: string) => {
  const { data, isLoading, failure } = useApiQuery({
    queryKey: QUERY_KEYS.topos(idSector),
    // Normalised once here, so every consumer reads the same starting point.
    queryFn: async () =>
      (await apiGet<Topo[]>(`/sectors/${idSector}/topos`)).map((topo) => ({
        ...topo,
        lines: topo.lines.map((line) => ({
          ...line,
          points: normalizeLineDirection(line.points)
        }))
      }))
  });

  return { topos: data ?? [], isLoading, failure };
};
