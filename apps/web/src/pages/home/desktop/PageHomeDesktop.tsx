import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

import { buildRegionPath } from '@web/app/router/routes';
import { EditToggleButton } from '@web/features/catalogEdit';
import { useGridColumns } from '@web/shared/lib';
import { ApiFeedback, GridColumnsMenu, PageBreadcrumbs } from '@web/shared/ui';

import { HomeHeading, RegionsGrid, useApiGetRegions } from '../common';
import { HomeEditSidebar } from './ui';

export const PageHomeDesktop = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { regions, isLoading, failure } = useApiGetRegions();
  const [isEditing, setIsEditing] = useState(false);
  const [idSelectedRegion, setIdSelectedRegion] = useState<string>();
  const [isSelectedDirty, setIsSelectedDirty] = useState(false);

  // No form is mounted once nothing is selected, so nothing would ever report
  // the edits as gone.
  const selectRegion = (idRegion?: string) => {
    setIdSelectedRegion(idRegion);
    setIsSelectedDirty(false);
  };
  const { columns, changeColumns } = useGridColumns(
    'crag-atlas:region-columns'
  );

  return (
    <PageStyled spacing={1}>
      <HeaderRowStyled>
        {/* The same trail every deeper screen has, so the header does not
            shift as the reader walks down into a region. */}
        <PageBreadcrumbs items={[{ label: t`Regions` }]} />
        <HeaderActionsStyled>
          {isEditing ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<CloseIcon fontSize="small" />}
              onClick={() => {
                setIsEditing(false);
                setIdSelectedRegion(undefined);
              }}
            >
              <Trans>Close editing</Trans>
            </Button>
          ) : (
            <EditToggleButton onClick={() => setIsEditing(true)} />
          )}
        </HeaderActionsStyled>
      </HeaderRowStyled>
      <HeaderRowStyled>
        <HomeHeading />
        <GridColumnsMenu columns={columns} onChange={changeColumns} />
      </HeaderRowStyled>
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading regions…</Trans>}
      />
      <ColumnsStyled isEditing={isEditing}>
        <RegionsGrid
          regions={regions}
          columns={columns}
          idSelectedRegion={isEditing ? idSelectedRegion : undefined}
          idDirtyRegion={isSelectedDirty ? idSelectedRegion : undefined}
          onSelect={(region) =>
            isEditing
              ? selectRegion(region.id)
              : navigate(buildRegionPath(region.id))
          }
        />
        {isEditing && (
          <HomeEditSidebar
            selectedRegion={regions.find(({ id }) => id === idSelectedRegion)}
            onSelectRegion={selectRegion}
            onDirtyChange={setIsSelectedDirty}
          />
        )}
      </ColumnsStyled>
    </PageStyled>
  );
};

const HeaderActionsStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

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
  /* The header rows sit close together; the cards need air under them. */
  padding-top: ${({ theme }) => theme.spacing(1)};
`;

const PageStyled = styled(Stack)`
  padding: ${({ theme }) => theme.spacing(2, 3, 3)};
`;
