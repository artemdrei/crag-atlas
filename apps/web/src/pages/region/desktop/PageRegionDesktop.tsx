import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useEditModeInUrl } from '@web/app/providers';
import { buildSectorPath, ROUTES } from '@web/app/router/routes';
import { CatalogEditActions } from '@web/features/catalogEdit';
import type { Coords } from '@web/features/sectorMap';
import {
  mapSectors,
  SectorMapDesktop,
  sectorPinColors,
  sectorPoint
} from '@web/features/sectorMap';
import { useGridColumns } from '@web/shared/lib';
import {
  ApiFeedback,
  GridColumnsMenu,
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
  const { region, failure: regionFailure } = useApiGetRegion(idRegion);
  const { isEditing, isArchiveShown, setIsEditing, setIsArchiveShown } =
    useEditModeInUrl();
  const [idSelectedSector, setIdSelectedSector] = useState<string>();
  const [isSelectedDirty, setIsSelectedDirty] = useState(false);
  const [draftPoint, setDraftPoint] = useState<Coords>();
  const { sectors, isLoading, failure } = useApiGetSectors(
    idRegion,
    isArchiveShown
  );

  // No form is mounted once nothing is selected, so nothing would ever report
  // the edits as gone.
  const selectSector = (idSector?: string) => {
    setIdSelectedSector(idSector);
    setIsSelectedDirty(false);
    setDraftPoint(sectorPoint(sectors.find(({ id }) => id === idSector)));
  };
  const { columns, changeColumns } = useGridColumns(
    'crag-atlas:sector-columns'
  );

  // The pin has to follow the cursor before the form is saved, so the selected
  // sector renders from the draft instead of from what the server knows.
  const mapped = useMemo(
    () =>
      mapSectors(
        sectors,
        isEditing && idSelectedSector
          ? { idSector: idSelectedSector, point: draftPoint }
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
      <HeaderRowStyled>
        <Typography variant="h4">{region?.name ?? '…'}</Typography>
        <GridColumnsMenu columns={columns} onChange={changeColumns} />
      </HeaderRowStyled>
      <ApiFeedback
        isLoading={isLoading}
        failure={regionFailure ?? failure}
        loadingLabel={<Trans>Loading sectors…</Trans>}
      />
      <BodyStyled>
        <SectorMapDesktop
          mapped={mapped}
          selectedSector={selectedSector}
          aside={
            isEditing && (
              <>
                <RegionEditSection region={region ?? undefined} />
                <RegionEditSidebar
                  region={region ?? undefined}
                  selectedSector={selectedSector}
                  point={draftPoint}
                  onSelectSector={selectSector}
                  onChangePoint={setDraftPoint}
                  onDirtyChange={setIsSelectedDirty}
                />
              </>
            )
          }
          mainFooter={
            <SectorsList
              sectors={sectors}
              pinColors={pinColors}
              idSelectedSector={idSelectedSector}
              idDirtySector={isSelectedDirty ? idSelectedSector : undefined}
              columns={columns}
              isEditing={isEditing}
              onSelect={(sector) =>
                isEditing
                  ? selectSector(sector.id)
                  : navigate(buildSectorPath(idRegion, sector.id))
              }
            />
          }
          isEditing={isEditing}
          onOpenSector={(idSector) =>
            navigate(buildSectorPath(idRegion, idSector))
          }
          onSelectSector={selectSector}
          onPlacePoint={setDraftPoint}
        />
      </BodyStyled>
    </PageShell>
  );
};

const BodyStyled = styled('div')`
  flex-grow: 1;
  min-height: 0;
  padding-top: ${({ theme }) => theme.spacing(1)};
`;

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;
