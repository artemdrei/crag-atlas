import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { buildSectorPath, ROUTES } from '@web/app/router/routes';
import { EditToggleButton } from '@web/features/catalogEdit';
import { useGridColumns } from '@web/shared/lib';
import { ApiFeedback, GridColumnsMenu, PageBreadcrumbs } from '@web/shared/ui';

import { SectorsList, useApiGetRegion, useApiGetSectors } from '../common';
import { RegionEditSidebar } from './ui';

export const PageRegionDesktop = () => {
  const { t } = useLingui();
  const { idRegion = '' } = useParams();
  const navigate = useNavigate();
  const { region } = useApiGetRegion(idRegion);
  const [isEditing, setIsEditing] = useState(false);
  const [idSelectedSector, setIdSelectedSector] = useState<string>();
  const { sectors, isLoading, failure } = useApiGetSectors(idRegion);
  const { columns, changeColumns } = useGridColumns(
    'crag-atlas:sector-columns'
  );

  return (
    <PageStyled spacing={3}>
      <HeaderRowStyled>
        <PageBreadcrumbs
          items={[
            { label: t`Regions`, to: ROUTES.INDEX },
            { label: region?.name ?? '…' }
          ]}
        />
        {isEditing ? (
          <Button
            size="small"
            variant="outlined"
            startIcon={<CloseIcon fontSize="small" />}
            onClick={() => {
              setIsEditing(false);
              setIdSelectedSector(undefined);
            }}
          >
            <Trans>Close editing</Trans>
          </Button>
        ) : (
          <EditToggleButton onClick={() => setIsEditing(true)} />
        )}
      </HeaderRowStyled>
      <HeaderRowStyled>
        <Typography variant="h4">{region?.name ?? '…'}</Typography>
        <GridColumnsMenu columns={columns} onChange={changeColumns} />
      </HeaderRowStyled>
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading sectors…</Trans>}
      />
      <ColumnsStyled isEditing={isEditing}>
        <SectorsList
          sectors={sectors}
          idSelectedSector={isEditing ? idSelectedSector : undefined}
          columns={columns}
          onSelect={(sector) =>
            isEditing
              ? setIdSelectedSector(sector.id)
              : navigate(buildSectorPath(idRegion, sector.id))
          }
        />
        {isEditing && (
          <RegionEditSidebar
            region={region ?? undefined}
            selectedSector={sectors.find(({ id }) => id === idSelectedSector)}
            onSelectSector={setIdSelectedSector}
          />
        )}
      </ColumnsStyled>
    </PageStyled>
  );
};

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;

// The sidebar takes a fixed slice, so the cards keep whatever is left rather
// than reflowing to a different column width as it opens.
const ColumnsStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isEditing'
})<{ isEditing: boolean }>`
  display: grid;
  grid-template-columns: ${({ isEditing }) =>
    isEditing ? 'minmax(0, 1fr) 360px' : 'minmax(0, 1fr)'};
  gap: ${({ theme }) => theme.spacing(3)};
  align-items: start;
`;

const PageStyled = styled(Stack)`
  padding: ${({ theme }) => theme.spacing(4)};
`;
