import { useState } from 'react';

import type { Region } from '@crag-atlas/api';
import { Trans } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import {
  ArchivedSectorPanel,
  ArchiveSectorButton,
  SectorCreateForm,
  SectorEditForm
} from '@web/features/catalogEdit';
import type { Coords } from '@web/features/sectorMap';
import { SectorPointEditor } from '@web/features/sectorMap';

import type { Sector } from '../../common';
import { SectorPhotoPicker } from './SectorPhotoPicker';

export interface Props {
  region?: Region;
  selectedSector?: Sector;
  point?: Coords;
  isArchiveShown: boolean;
  onSelectSector: (idSector?: string) => void;
  onChangePoint: (point?: Coords) => void;
  onDirtyChange: (isDirty: boolean) => void;
}

export const RegionEditSidebar = ({
  region,
  selectedSector,
  point,
  isArchiveShown,
  onSelectSector,
  onChangePoint,
  onDirtyChange
}: Props) => {
  const [isAdding, setIsAdding] = useState(false);

  if (isAdding && region) {
    return (
      <SidebarStyled>
        <SectorCreateForm
          idRegion={region.id}
          onCreated={(sector) => {
            setIsAdding(false);
            onSelectSector(sector.id);
          }}
          onClose={() => setIsAdding(false)}
        />
      </SidebarStyled>
    );
  }

  if (selectedSector) {
    return (
      <SidebarStyled>
        {!selectedSector.isDeleted && (
          <SectorPhotoPicker idSector={selectedSector.id} />
        )}
        {selectedSector.isDeleted ? (
          <ArchivedSectorPanel
            sector={selectedSector}
            onDone={() => onSelectSector(undefined)}
          />
        ) : (
          /* Seeded from props once, so another sector needs another
             instance. */
          <SectorEditForm
            key={selectedSector.id}
            sector={selectedSector}
            point={point}
            onClose={() => onSelectSector(undefined)}
            onDirtyChange={onDirtyChange}
            leftAction={
              <ArchiveSectorButton
                sector={selectedSector}
                onArchived={() => onSelectSector(undefined)}
              />
            }
          >
            <SectorPointEditor point={point} onChange={onChangePoint} />
          </SectorEditForm>
        )}
      </SidebarStyled>
    );
  }

  return (
    <SidebarStyled>
      <HintStyled>
        <span aria-hidden="true">👈</span>
        <Typography variant="body2" color="text.secondary">
          {isArchiveShown ? (
            <Trans>Pick an archived sector on the left to restore it.</Trans>
          ) : (
            <Trans>Pick a sector on the left to edit it.</Trans>
          )}
        </Typography>
        {!isArchiveShown && (
          <>
            <CenteredStyled variant="body2" color="text.secondary">
              <Trans>Or</Trans>
            </CenteredStyled>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AddIcon fontSize="small" />}
              onClick={() => setIsAdding(true)}
            >
              <Trans>Add sector</Trans>
            </Button>
          </>
        )}
      </HintStyled>
    </SidebarStyled>
  );
};

const SidebarStyled = styled('div')`
  display: flex;
  flex: none;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const HintStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing(1)};
  text-align: center;

  & > span {
    align-self: center;
    font-size: ${({ theme }) => theme.typography.h5.fontSize};
  }
`;

const CenteredStyled = styled(Typography)`
  text-align: center;
`;
