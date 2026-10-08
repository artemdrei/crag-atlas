import { useMemo } from 'react';
import { useParams } from 'react-router';

import type { CatalogSource } from '@crag-atlas/analytics';
import { styled, useTheme } from '@mui/material/styles';

import { useEditModeInUrl, useUser } from '@web/app/providers';
import { useOpenCatalogItem } from '@web/app/router/useOpenCatalogItem';
import { CatalogEditActions } from '@web/features/catalogEdit';
import {
  RouteFilterPanelDesktop,
  useRouteFilterSearch
} from '@web/features/routeFilter';
import { RegionConditionsDesktop } from '@web/features/sectorConditions';
import {
  mapSectors,
  SectorMapDesktop,
  sectorPinColors
} from '@web/features/sectorMap';
import { useApiGetRegion } from '@web/shared/api';
import { coordsOf, useCatalogSelection } from '@web/shared/lib';
import {
  ApiFeedback,
  CatalogExplorerLayout,
  PageShell,
  PageTitle
} from '@web/shared/ui';

import {
  ArchivedRegionNotice,
  RegionRoutesTitle,
  type Sector,
  SectorsList,
  useApiGetSectors,
  useApiGetTickedSectors,
  useRegionRouteFilter
} from '../common';
import { RegionEditSection, RegionEditSidebar } from './ui';

export const PageRegionDesktop = () => {
  const theme = useTheme();
  const { idRegion = '' } = useParams();
  const openCatalogItem = useOpenCatalogItem();
  const { hasRole } = useUser();
  const { region, failure: regionFailure } = useApiGetRegion(idRegion);
  const { isEditing, isArchiveShown, setIsEditing, setIsArchiveShown } =
    useEditModeInUrl();
  const { sectors, isLoading, failure } = useApiGetSectors(
    idRegion,
    isArchiveShown
  );
  const { tickedOf, tickedRoutes } = useApiGetTickedSectors(idRegion);
  const filterSearch = useRouteFilterSearch();
  const isFilterShown = !isEditing && !isArchiveShown;
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
    isEnabled: isFilterShown
  });
  const {
    idSelected: idSelectedSector,
    isDirty: isSelectedDirty,
    draftPoint,
    select: selectSector,
    setIsDirty: setIsSelectedDirty,
    setDraftPoint
  } = useCatalogSelection(sectors);

  const mapped = useMemo(
    () =>
      mapSectors(
        sectors,
        isEditing && idSelectedSector
          ? { id: idSelectedSector, point: draftPoint }
          : undefined
      ),
    [sectors, isEditing, idSelectedSector, draftPoint]
  );

  const pinColors = useMemo(
    () => sectorPinColors(mapped, theme.palette.sectorPin),
    [mapped, theme.palette.sectorPin]
  );

  const selectedSector = sectors.find(({ id }) => id === idSelectedSector);

  const openSector = (source: CatalogSource, sector: Sector) =>
    openCatalogItem(
      source,
      { name: sector.name, idRegion, idSector: sector.id },
      filterSearch
    );

  return (
    <PageShell spacing={1} isFixedHeight>
      <HeaderRowStyled>
        <CatalogEditActions
          isEditing={isEditing}
          isArchiveShown={isArchiveShown}
          canEdit={!region?.isArchived}
          onEdit={() => setIsEditing(true)}
          onClose={() => {
            setIsEditing(false);
            selectSector(undefined);
          }}
          onToggleArchive={() => setIsArchiveShown(!isArchiveShown)}
        />
      </HeaderRowStyled>
      {region?.isArchived && <ArchivedRegionNotice />}
      <PageTitle name={region?.name} nameLocal={region?.nameLocal} />
      <ApiFeedback failure={regionFailure ?? failure} />
      <CatalogExplorerLayout
        list={
          <>
            <ConditionsSlotStyled>
              {region && (
                <RegionConditionsDesktop
                  idRegion={idRegion}
                  coords={coordsOf(region)}
                />
              )}
            </ConditionsSlotStyled>
            {isFilterShown && (
              <RouteFilterPanelDesktop
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
              />
            )}
            <SectorsList
              sectors={orderedSectors}
              matchOf={matchOf}
              pinColors={pinColors}
              tickedOf={tickedOf}
              idSelectedSector={idSelectedSector}
              idDirtySector={isSelectedDirty ? idSelectedSector : undefined}
              isEditing={isEditing}
              isLoading={isLoading}
              onSelect={(sector) =>
                isEditing ? selectSector(sector.id) : openSector('card', sector)
              }
              onShowOnMap={(sector) => selectSector(sector.id)}
              onEdit={
                hasRole('admin')
                  ? (sector) => {
                      selectSector(sector.id);
                      setIsEditing(true);
                    }
                  : undefined
              }
            />
          </>
        }
        map={
          <SectorMapDesktop
            mapped={mapped}
            selectedSector={selectedSector}
            isEditing={isEditing}
            onOpenSector={(sector) => openSector('map', sector)}
            onSelectSector={selectSector}
            onPlacePoint={setDraftPoint}
          />
        }
        aside={
          isEditing && (
            <>
              <RegionEditSection region={region ?? undefined} />
              <RegionEditSidebar
                region={region ?? undefined}
                selectedSector={selectedSector}
                point={draftPoint}
                isArchiveShown={isArchiveShown}
                onSelectSector={selectSector}
                onChangePoint={setDraftPoint}
                onDirtyChange={setIsSelectedDirty}
              />
            </>
          )
        }
      />
    </PageShell>
  );
};

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const ConditionsSlotStyled = styled('div')`
  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
`;
