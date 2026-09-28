import { useState } from 'react';

import { Trans } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import {
  ArchivedRegionPanel,
  ArchiveRegionButton,
  RegionCreateForm,
  RegionEditForm,
  RegionPhotoPicker
} from '@web/features/catalogEdit';
import type { Coords } from '@web/shared/types';
import { PointEditor } from '@web/shared/ui';

import type { Region } from '../../common';

export interface Props {
  selectedRegion?: Region;
  point?: Coords;
  isArchiveShown: boolean;
  onSelectRegion: (idRegion?: string) => void;
  onChangePoint: (point?: Coords) => void;
  onDirtyChange: (isDirty: boolean) => void;
}

export const HomeEditSidebar = ({
  selectedRegion,
  point,
  isArchiveShown,
  onSelectRegion,
  onChangePoint,
  onDirtyChange
}: Props) => {
  const [isAdding, setIsAdding] = useState(false);

  if (isAdding) {
    return (
      <SidebarStyled>
        <RegionCreateForm
          point={point}
          onClose={() => setIsAdding(false)}
          onPointChange={onChangePoint}
        >
          <PointEditor point={point} onChange={onChangePoint} />
        </RegionCreateForm>
      </SidebarStyled>
    );
  }

  if (selectedRegion?.isDeleted) {
    return (
      <SidebarStyled>
        <ArchivedRegionPanel
          region={selectedRegion}
          onDone={() => onSelectRegion(undefined)}
        />
      </SidebarStyled>
    );
  }

  if (selectedRegion) {
    return (
      <SidebarStyled>
        {!isArchiveShown && (
          <AddButtonStyled
            fullWidth
            variant="outlined"
            startIcon={<AddIcon fontSize="small" />}
            onClick={() => {
              onSelectRegion(undefined);
              setIsAdding(true);
            }}
          >
            <Trans>Add region</Trans>
          </AddButtonStyled>
        )}
        <RegionPhotoPicker
          idRegion={selectedRegion.id}
          photoUrl={selectedRegion.photoUrl}
        />
        {/* Seeded from props once, so another region needs another instance. */}
        <RegionEditForm
          key={selectedRegion.id}
          region={selectedRegion}
          point={point}
          onClose={() => onSelectRegion(undefined)}
          onDirtyChange={onDirtyChange}
          onPointChange={onChangePoint}
          leftAction={
            <ArchiveRegionButton
              region={selectedRegion}
              onArchived={() => onSelectRegion(undefined)}
            />
          }
        >
          <PointEditor point={point} onChange={onChangePoint} />
        </RegionEditForm>
      </SidebarStyled>
    );
  }

  return (
    <SidebarStyled>
      <HintStyled>
        <span aria-hidden="true">👈</span>
        <Typography variant="body2" color="text.secondary">
          {isArchiveShown ? (
            <Trans>Pick an archived region on the left to restore it.</Trans>
          ) : (
            <Trans>Pick a region on the left to edit it.</Trans>
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
              <Trans>Add region</Trans>
            </Button>
          </>
        )}
      </HintStyled>
    </SidebarStyled>
  );
};

const SidebarStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  min-height: 0;
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const AddButtonStyled = styled(Button)`
  flex-shrink: 0;
`;

const HintStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(2)};
  text-align: center;

  & > span {
    align-self: center;
    font-size: ${({ theme }) => theme.typography.h5.fontSize};
  }
`;

const CenteredStyled = styled(Typography)`
  text-align: center;
`;
