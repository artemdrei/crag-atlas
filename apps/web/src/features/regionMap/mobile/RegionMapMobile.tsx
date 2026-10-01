import { useState } from 'react';

import type { Region } from '@crag-atlas/api';
import { styled, useTheme } from '@mui/material/styles';

import { BottomSheet, MapCanvas } from '@web/shared/ui';

import type { MappedRegion } from '../common';
import { REGION_ZOOM, RegionPointCard, regionMapPoints } from '../common';

export interface Props {
  mapped: MappedRegion[];
  onOpenRegion: (region: Region) => void;
}

export const RegionMapMobile = ({ mapped, onOpenRegion }: Props) => {
  const theme = useTheme();
  const [idSelectedRegion, setIdSelectedRegion] = useState<string>();
  const selected = mapped.find(
    ({ region }) => region.id === idSelectedRegion
  )?.region;

  return (
    <MapAreaStyled>
      <MapCanvas
        points={regionMapPoints(mapped, theme.palette.primary.main)}
        idSelected={idSelectedRegion}
        selectedZoom={REGION_ZOOM}
        onSelect={setIdSelectedRegion}
      />

      <BottomSheet
        isOpen={!!selected}
        onClose={() => setIdSelectedRegion(undefined)}
      >
        {selected && (
          <SheetStyled>
            <RegionPointCard
              region={selected}
              onOpen={() => onOpenRegion(selected)}
            />
          </SheetStyled>
        )}
      </BottomSheet>
    </MapAreaStyled>
  );
};

const MapAreaStyled = styled('div')`
  height: 40vh;
  height: 40dvh;
`;

const SheetStyled = styled('div')`
  padding: ${({ theme }) => theme.spacing(0, 2, 2)};
`;
