import type { ReactNode } from 'react';
import { useState } from 'react';

import type { Sector } from '@crag-atlas/api';
import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled, useTheme } from '@mui/material/styles';

import { coordsOf } from '@web/shared/lib';
import {
  BottomSheet,
  CollapsibleMap,
  DirectionsButton,
  MapCanvas
} from '@web/shared/ui';

import type { MappedSector } from '../common';
import { sectorMapPoints } from '../common';

export interface Props {
  mapped: MappedSector[];
  renderSector: (sector: Sector) => ReactNode;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  onOpenSector: (sector: Sector) => void;
}

export const SectorMapMobile = ({
  mapped,
  renderSector,
  isCollapsed,
  onToggleCollapsed,
  onOpenSector
}: Props) => {
  const theme = useTheme();
  const [idSelectedSector, setIdSelectedSector] = useState<string>();
  const selected = mapped.find(
    ({ sector }) => sector.id === idSelectedSector
  )?.sector;

  return (
    <CollapsibleMap
      isCollapsed={isCollapsed}
      hasShowButton={false}
      onToggle={onToggleCollapsed}
    >
      <MapCanvas
        points={sectorMapPoints(mapped, theme.palette.sectorPin)}
        idSelected={idSelectedSector}
        onSelect={setIdSelectedSector}
      />

      <BottomSheet
        isOpen={!!selected}
        onClose={() => setIdSelectedSector(undefined)}
      >
        {selected && (
          <>
            {renderSector(selected)}
            <ActionsStyled>
              <DirectionsButton
                entityType="sector"
                point={coordsOf(selected)}
              />
              <Button
                variant="contained"
                onClick={() => onOpenSector(selected)}
              >
                <Trans>Open sector</Trans>
              </Button>
            </ActionsStyled>
          </>
        )}
      </BottomSheet>
    </CollapsibleMap>
  );
};

const ActionsStyled = styled('div')`
  display: flex;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(2)};

  & > * {
    flex: none;
    white-space: nowrap;
  }

  & > *:last-child {
    flex: 1 1 auto;
  }
`;
