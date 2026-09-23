import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';

import { useEditModeInUrl } from '@web/app/providers';
import { buildRegionPath } from '@web/app/router/routes';
import { CatalogEditActions } from '@web/features/catalogEdit';
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
  const { isEditing, isArchiveShown, setIsEditing, setIsArchiveShown } =
    useEditModeInUrl();
  const { regions, isLoading, failure } = useApiGetRegions(isArchiveShown);
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
        <CatalogEditActions
          isEditing={isEditing}
          isArchiveShown={isArchiveShown}
          onEdit={() => setIsEditing(true)}
          onClose={() => {
            setIsEditing(false);
            setIdSelectedRegion(undefined);
          }}
          onToggleArchive={() => setIsArchiveShown(!isArchiveShown)}
        />
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
        <GridAreaStyled
          onClick={(event) => {
            if (event.target === event.currentTarget) selectRegion(undefined);
          }}
        >
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
        </GridAreaStyled>
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

// The empty page under the cards is what clears the selection, so it has to
// be a real surface rather than however tall the cards happen to be.
const GridAreaStyled = styled('div')`
  min-height: 60vh;
`;

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;
