import { useMemo } from 'react';

import { useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';

import { useEditModeInUrl, useUser } from '@web/app/providers';
import { useOpenCatalogItem } from '@web/app/router/useOpenCatalogItem';
import { CatalogEditActions } from '@web/features/catalogEdit';
import { CatalogSearchDesktop } from '@web/features/catalogSearch';
import { mapRegions, RegionMapDesktop } from '@web/features/regionMap';
import { useCatalogSelection } from '@web/shared/lib';
import {
  ApiFeedback,
  CatalogExplorerLayout,
  PageBreadcrumbs,
  PageShell
} from '@web/shared/ui';

import { HomeHeading, RegionsGrid, useApiGetRegions } from '../common';
import { HomeEditSidebar } from './ui';

export const PageHomeDesktop = () => {
  const { t } = useLingui();
  const openCatalogItem = useOpenCatalogItem();
  const { hasRole } = useUser();
  const { isEditing, isArchiveShown, setIsEditing, setIsArchiveShown } =
    useEditModeInUrl();
  const { regions, isLoading, failure } = useApiGetRegions(isArchiveShown);
  const {
    idSelected: idSelectedRegion,
    isDirty: isSelectedDirty,
    draftPoint,
    select: selectRegion,
    setIsDirty: setIsSelectedDirty,
    setDraftPoint
  } = useCatalogSelection(regions);

  const selectedRegion = regions.find(({ id }) => id === idSelectedRegion);
  const mapped = useMemo(
    () =>
      mapRegions(
        regions,
        isEditing && idSelectedRegion
          ? { id: idSelectedRegion, point: draftPoint }
          : undefined
      ),
    [regions, isEditing, idSelectedRegion, draftPoint]
  );
  return (
    <PageShell spacing={1} isFixedHeight>
      <HeaderRowStyled>
        {/* The same trail every deeper screen has, so the header does not
            shift as the reader walks down into a region. */}
        <PageBreadcrumbs items={[{ label: t`Regions` }]} />
        <CatalogEditActions
          isEditing={isEditing}
          isArchiveShown={isArchiveShown}
          onEdit={() => setIsEditing(true)}
          onClose={() => {
            setIsEditing(false);
            selectRegion(undefined);
          }}
          onToggleArchive={() => setIsArchiveShown(!isArchiveShown)}
        />
      </HeaderRowStyled>
      <HomeHeading />
      <ApiFeedback failure={failure} />
      <CatalogExplorerLayout
        search={<CatalogSearchDesktop />}
        list={
          <ListAreaStyled
            onClick={(event) => {
              if (event.target === event.currentTarget) selectRegion(undefined);
            }}
          >
            <RegionsGrid
              regions={regions}
              idSelectedRegion={idSelectedRegion}
              isLoading={isLoading}
              idDirtyRegion={isSelectedDirty ? idSelectedRegion : undefined}
              onSelect={(region) =>
                isEditing
                  ? selectRegion(region.id)
                  : openCatalogItem('card', {
                      name: region.name,
                      idRegion: region.id
                    })
              }
              onShowOnMap={(region) => selectRegion(region.id)}
              onEdit={
                hasRole('admin')
                  ? (region) => {
                      selectRegion(region.id);
                      setIsEditing(true);
                    }
                  : undefined
              }
            />
          </ListAreaStyled>
        }
        map={
          <RegionMapDesktop
            mapped={mapped}
            selectedRegion={selectedRegion}
            draftPoint={draftPoint}
            isEditing={isEditing}
            onOpenRegion={(region) =>
              openCatalogItem('map', { name: region.name, idRegion: region.id })
            }
            onSelectRegion={selectRegion}
            onPlacePoint={setDraftPoint}
          />
        }
        aside={
          isEditing && (
            <HomeEditSidebar
              selectedRegion={selectedRegion}
              point={draftPoint}
              isArchiveShown={isArchiveShown}
              onSelectRegion={selectRegion}
              onChangePoint={setDraftPoint}
              onDirtyChange={setIsSelectedDirty}
            />
          )
        }
      />
    </PageShell>
  );
};

// The empty space under the cards is what clears the selection, so it needs a
// height of its own.
const ListAreaStyled = styled('div')`
  min-height: 100%;
`;

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;
