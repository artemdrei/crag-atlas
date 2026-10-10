import { useMemo } from 'react';
import { useParams } from 'react-router';

import type { CatalogSource } from '@crag-atlas/analytics';
import { useLingui } from '@lingui/react/macro';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';

import { useOpenCatalogItem } from '@web/app/router/useOpenCatalogItem';
import {
  RouteFilterPanelMobile,
  useRouteFilterSearch
} from '@web/features/routeFilter';
import {
  mapSectors,
  SectorMapMobile,
  sectorPinColors
} from '@web/features/sectorMap';
import { useApiGetRegion } from '@web/shared/api';
import { useStoredFlag } from '@web/shared/lib';
import { ApiFeedback, PageShell, PageTitle } from '@web/shared/ui';

import {
  ArchivedRegionNotice,
  RegionRoutesTitle,
  type Sector,
  SectorCard,
  SectorsList,
  useApiGetSectors,
  useApiGetTickedSectors,
  useRegionRouteFilter
} from '../common';

const SECTOR_MAP_COLLAPSED_KEY = 'crag-atlas:sector-map-collapsed';

export const PageRegionMobile = () => {
  const { idRegion = '' } = useParams();
  const openCatalogItem = useOpenCatalogItem();
  const { t } = useLingui();
  const theme = useTheme();
  const { value: isMapCollapsed, toggle: toggleMap } = useStoredFlag(
    SECTOR_MAP_COLLAPSED_KEY,
    false
  );
  const { region, failure: regionFailure } = useApiGetRegion(idRegion);
  const { sectors, isLoading, failure } = useApiGetSectors(idRegion);
  const { tickedOf, tickedRoutes } = useApiGetTickedSectors(idRegion);
  const filterSearch = useRouteFilterSearch();
  const {
    state: filterState,
    gradeOrder,
    orderedSectors,
    matchOf,
    matchedCount,
    matchedSectorCount
  } = useRegionRouteFilter({
    sectors,
    gradeHistogram: region?.gradeHistogram,
    tickedRoutes,
    isEnabled: true
  });
  const mapped = useMemo(() => mapSectors(sectors), [sectors]);
  const pinColors = useMemo(
    () => sectorPinColors(mapped, theme.palette.sectorPin),
    [mapped, theme.palette.sectorPin]
  );

  const openSector = (source: CatalogSource, sector: Sector) =>
    openCatalogItem(
      source,
      { name: sector.name, idRegion, idSector: sector.id },
      filterSearch
    );

  return (
    <PageShell spacing={2} isCompact>
      {region?.isArchived && <ArchivedRegionNotice />}
      <PageTitle
        name={region?.name}
        nameLocal={region?.nameLocal}
        variant="h5"
      />
      <ApiFeedback failure={regionFailure ?? failure} />
      <SectorMapMobile
        mapped={mapped}
        isCollapsed={isMapCollapsed}
        onToggleCollapsed={toggleMap}
        renderSector={(sector) => (
          <SectorCard
            sector={sector}
            pinColor={pinColors[sector.id]}
            onSelect={() => openSector('map', sector)}
          />
        )}
        onOpenSector={(sector) => openSector('map', sector)}
      />
      <RouteFilterPanelMobile
        state={filterState}
        title={
          <RegionRoutesTitle
            routesCount={matchedCount}
            sectorsCount={matchedSectorCount}
            isFiltered={filterState.activeCount > 0}
          />
        }
        routesCount={matchedCount}
        gradeHistogram={region?.gradeHistogram ?? []}
        gradeOrder={gradeOrder}
        extraAction={
          isMapCollapsed && (
            <IconButton aria-label={t`Show map`} onClick={toggleMap}>
              <MapOutlinedIcon />
            </IconButton>
          )
        }
      />
      <SectorsList
        sectors={orderedSectors}
        matchOf={matchOf}
        pinColors={pinColors}
        tickedOf={tickedOf}
        isLoading={isLoading}
        onSelect={(sector) => openSector('card', sector)}
      />
    </PageShell>
  );
};
