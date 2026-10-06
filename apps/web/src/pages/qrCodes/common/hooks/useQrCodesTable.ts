import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';

import type { SectorQr } from '@crag-atlas/api';

const REGION_PARAM = 'region';

export interface RegionOption {
  idRegion: string;
  regionName: string;
}

export const useQrCodesTable = (rows: SectorQr[]) => {
  const [params, setParams] = useSearchParams();
  const idRegion = params.get(REGION_PARAM) ?? '';
  const [idsSelected, setIdsSelected] = useState<Set<string>>(new Set());

  const regions = useMemo<RegionOption[]>(
    () => [
      ...new Map(
        rows.map(({ idRegion: id, regionName }) => [
          id,
          { idRegion: id, regionName }
        ])
      ).values()
    ],
    [rows]
  );

  const visibleRows = rows.filter((row) => row.idRegion === idRegion);
  const selectedRows = visibleRows.filter(({ idSector }) =>
    idsSelected.has(idSector)
  );
  const withPath = visibleRows.filter(({ path }) => !!path);

  const selectRegion = (next: string) => {
    setIdsSelected(new Set());
    setParams({ [REGION_PARAM]: next });
  };

  const toggle = (idSector: string) =>
    setIdsSelected((previous) => {
      const next = new Set(previous);

      if (next.has(idSector)) next.delete(idSector);
      else next.add(idSector);

      return next;
    });

  const isAllSelected =
    visibleRows.length > 0 && selectedRows.length === visibleRows.length;

  const toggleAll = () =>
    setIdsSelected(
      isAllSelected
        ? new Set()
        : new Set(visibleRows.map(({ idSector }) => idSector))
    );

  return {
    idRegion,
    regions,
    visibleRows,
    selectedRows,
    coverage: { withPath: withPath.length, total: visibleRows.length },
    isAllSelected,
    isSomeSelected: selectedRows.length > 0 && !isAllSelected,
    selectRegion,
    toggle,
    toggleAll,
    isSelected: (idSector: string) => idsSelected.has(idSector)
  };
};

export type QrCodesTableState = ReturnType<typeof useQrCodesTable>;
