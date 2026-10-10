import { useState } from 'react';

import type { Region } from '@crag-atlas/api';
import { styled, useTheme } from '@mui/material/styles';

import { useStoredFlag } from '@web/shared/lib';
import { BottomSheet, CollapsibleMap, MapCanvas } from '@web/shared/ui';

import type { MappedRegion } from '../common';
import { REGION_ZOOM, RegionPointCard, regionMapPoints } from '../common';

const STORAGE_KEY = 'crag-atlas:region-map-collapsed';

export interface Props {
  mapped: MappedRegion[];
  onOpenRegion: (region: Region) => void;
}

export const RegionMapMobile = ({ mapped, onOpenRegion }: Props) => {
  const theme = useTheme();
  const { value: isCollapsed, toggle } = useStoredFlag(STORAGE_KEY, false);
  const [idSelectedRegion, setIdSelectedRegion] = useState<string>();
  const selected = mapped.find(
    ({ region }) => region.id === idSelectedRegion
  )?.region;

  return (
    <CollapsibleMap isCollapsed={isCollapsed} onToggle={toggle}>
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
    </CollapsibleMap>
  );
};

const SheetStyled = styled('div')`
  padding: ${({ theme }) => theme.spacing(0, 2, 2)};
`;
