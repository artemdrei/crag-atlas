import type { ReactNode } from 'react';
import { useState } from 'react';

import type { Sector } from '@crag-atlas/api';
import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled, useTheme } from '@mui/material/styles';

import { coordsOf } from '@web/shared/lib';
import { BottomSheet, DirectionsButton, MapCanvas } from '@web/shared/ui';

import type { MappedSector } from '../common';
import { sectorMapPoints } from '../common';

export interface Props {
  mapped: MappedSector[];
  renderSector: (sector: Sector) => ReactNode;
  onOpenSector: (idSector: string) => void;
}

export const SectorMapMobile = ({
  mapped,
  renderSector,
  onOpenSector
}: Props) => {
  const theme = useTheme();
  const [idSelectedSector, setIdSelectedSector] = useState<string>();
  const selected = mapped.find(
    ({ sector }) => sector.id === idSelectedSector
  )?.sector;

  return (
    <MapAreaStyled>
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
              <DirectionsButton point={coordsOf(selected)} />
              <Button
                variant="contained"
                onClick={() => onOpenSector(selected.id)}
              >
                <Trans>Open sector</Trans>
              </Button>
            </ActionsStyled>
          </>
        )}
      </BottomSheet>
    </MapAreaStyled>
  );
};

const MapAreaStyled = styled('div')`
  height: 40vh;
  height: 40dvh;
`;

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
