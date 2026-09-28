import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useEditModeInUrl, useUser } from '@web/app/providers';
import { buildSectorPath, ROUTES } from '@web/app/router/routes';
import { CatalogEditActions } from '@web/features/catalogEdit';
import { CatalogSearchDesktop } from '@web/features/catalogSearch';
import {
  mapSectors,
  SectorMapDesktop,
  sectorPinColors
} from '@web/features/sectorMap';
import { useCatalogSelection } from '@web/shared/lib';
import {
  ApiFeedback,
  CatalogExplorerLayout,
  PageBreadcrumbs,
  PageShell
} from '@web/shared/ui';

import {
  ArchivedRegionNotice,
  SectorsList,
  useApiGetRegion,
  useApiGetSectors
} from '../common';
import { RegionEditSection, RegionEditSidebar } from './ui';

export const PageRegionDesktop = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { idRegion = '' } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useUser();
  const { region, failure: regionFailure } = useApiGetRegion(idRegion);
  const { isEditing, isArchiveShown, setIsEditing, setIsArchiveShown } =
    useEditModeInUrl();
  const { sectors, isLoading, failure } = useApiGetSectors(
    idRegion,
    isArchiveShown
  );
  const {
    idSelected: idSelectedSector,
    isDirty: isSelectedDirty,
    draftPoint,
    select: selectSector,
    setIsDirty: setIsSelectedDirty,
    setDraftPoint
  } = useCatalogSelection(sectors, isEditing);

  // The pin has to follow the cursor before the form is saved, so the selected
  // sector renders from the draft instead of from what the server knows.
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

  return (
    <PageShell spacing={1} isFixedHeight>
      <HeaderRowStyled>
        <PageBreadcrumbs
          items={[
            { label: t`Regions`, to: ROUTES.INDEX },
            { label: region?.name ?? '…' }
          ]}
        />
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
      <Typography variant="h4" noWrap>
        {region?.name ?? '…'}
      </Typography>
      <ApiFeedback
        isLoading={isLoading}
        failure={regionFailure ?? failure}
        loadingLabel={<Trans>Loading sectors…</Trans>}
      />
      <CatalogExplorerLayout
        search={<CatalogSearchDesktop />}
        list={
          <SectorsList
            sectors={sectors}
            pinColors={pinColors}
            idSelectedSector={idSelectedSector}
            idDirtySector={isSelectedDirty ? idSelectedSector : undefined}
            isEditing={isEditing}
            onSelect={(sector) =>
              isEditing
                ? selectSector(sector.id)
                : navigate(buildSectorPath(idRegion, sector.id))
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
        }
        map={
          <SectorMapDesktop
            mapped={mapped}
            selectedSector={selectedSector}
            isEditing={isEditing}
            onOpenSector={(idSector) =>
              navigate(buildSectorPath(idRegion, idSector))
            }
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
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;
