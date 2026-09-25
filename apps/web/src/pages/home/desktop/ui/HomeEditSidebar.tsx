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

import type { Region } from '../../common';

export interface Props {
  selectedRegion?: Region;
  isArchiveShown: boolean;
  onSelectRegion: (idRegion?: string) => void;
  onDirtyChange: (isDirty: boolean) => void;
}

export const HomeEditSidebar = ({
  selectedRegion,
  isArchiveShown,
  onSelectRegion,
  onDirtyChange
}: Props) => {
  const [isAdding, setIsAdding] = useState(false);

  if (isAdding) {
    return (
      <SidebarStyled>
        <RegionCreateForm onClose={() => setIsAdding(false)} />
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
        <RegionPhotoPicker
          idRegion={selectedRegion.id}
          photoUrl={selectedRegion.photoUrl}
        />
        {/* Seeded from props once, so another region needs another instance. */}
        <RegionEditForm
          key={selectedRegion.id}
          region={selectedRegion}
          onDirtyChange={onDirtyChange}
          leftAction={
            <ArchiveRegionButton
              region={selectedRegion}
              onArchived={() => onSelectRegion(undefined)}
            />
          }
        />
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
