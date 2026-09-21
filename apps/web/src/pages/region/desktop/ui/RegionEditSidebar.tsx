import { useState } from 'react';

import type { Region } from '@crag-atlas/api';
import { Trans } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import {
  RegionEditForm,
  SectorCreateForm,
  SectorEditForm
} from '@web/features/catalogEdit';

import type { Sector } from '../../common';
import { SectorPhotoPicker } from './SectorPhotoPicker';

export interface Props {
  region?: Region;
  selectedSector?: Sector;
  onSelectSector: (idSector?: string) => void;
  onDirtyChange: (isDirty: boolean) => void;
}

export const RegionEditSidebar = ({
  region,
  selectedSector,
  onSelectSector,
  onDirtyChange
}: Props) => {
  // The region's own fields are set once; sectors are what this panel is for.
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  return (
    <SidebarStyled>
      <SectionToggleStyled
        type="button"
        aria-expanded={isRegionOpen}
        onClick={() => setIsRegionOpen((open) => !open)}
      >
        <Typography variant="subtitle2">
          <Trans>Region</Trans>
        </Typography>
        <ExpandMoreIcon fontSize="small" />
      </SectionToggleStyled>
      <Collapse in={isRegionOpen} unmountOnExit>
        {region && <RegionEditForm region={region} />}
      </Collapse>
      <Divider />
      {isAdding && region ? (
        <>
          <BackButtonStyled
            size="small"
            startIcon={<ArrowBackIcon fontSize="small" />}
            onClick={() => setIsAdding(false)}
          >
            <Trans>Back</Trans>
          </BackButtonStyled>
          <SectorCreateForm idRegion={region.id} />
        </>
      ) : selectedSector ? (
        <>
          <BackButtonStyled
            size="small"
            startIcon={<ArrowBackIcon fontSize="small" />}
            onClick={() => onSelectSector(undefined)}
          >
            <Trans>All sectors</Trans>
          </BackButtonStyled>
          <SectorPhotoPicker idSector={selectedSector.id} />
          {/* Seeded from props once, so another sector needs another instance. */}
          <SectorEditForm
            key={selectedSector.id}
            sector={selectedSector}
            onDirtyChange={onDirtyChange}
          />
        </>
      ) : (
        <HintStyled>
          <span aria-hidden="true">👈</span>
          <Typography variant="body2" color="text.secondary">
            <Trans>Pick a sector on the left to edit it.</Trans>
          </Typography>
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
        </HintStyled>
      )}
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

// A direct child of the column would stretch, which centres its label.
const BackButtonStyled = styled(Button)`
  align-self: flex-start;
`;

const SectionToggleStyled = styled(ButtonBase)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
  padding: ${({ theme }) => theme.spacing(0.5, 0)};

  & svg {
    transition: transform 0.15s ease-out;
  }

  &[aria-expanded='true'] svg {
    transform: rotate(180deg);
  }
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
