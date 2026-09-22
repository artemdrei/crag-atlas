import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

import { buildRegionPath } from '@web/app/router/routes';
import { EditToggleButton } from '@web/features/catalogEdit';
import { useGridColumns } from '@web/shared/lib';
import {
  ApiFeedback,
  CatalogColumns,
  GridColumnsMenu,
  PageBreadcrumbs,
  PageShell
} from '@web/shared/ui';

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
    <PageShell spacing={1}>
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
      <CatalogColumns isEditing={isEditing}>
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
      </CatalogColumns>
    </PageShell>
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
