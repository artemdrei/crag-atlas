import type { Sector } from '@crag-atlas/api';
import { useTheme } from '@mui/material/styles';

import type { Coords } from '@web/shared/types';
import { MapArea, MapCanvas } from '@web/shared/ui';

import type { MappedSector } from '../common';
import { SectorPointCard, sectorMapPoints } from '../common';

export interface Props {
  mapped: MappedSector[];
  selectedSector?: Sector;
  isEditing?: boolean;
  onOpenSector: (idSector: string) => void;
  onSelectSector: (idSector: string) => void;
  onPlacePoint: (point: Coords) => void;
}

export const SectorMapDesktop = ({
  mapped,
  selectedSector,
  isEditing,
  onOpenSector,
  onSelectSector,
  onPlacePoint
}: Props) => {
  const theme = useTheme();

  return (
    <MapArea>
      <MapCanvas
        points={sectorMapPoints(mapped, theme.palette.sectorPin)}
        details={
          selectedSector &&
          !isEditing && (
            <SectorPointCard
              sector={selectedSector}
              onOpen={() => onOpenSector(selectedSector.id)}
            />
          )
        }
        idSelected={selectedSector?.id}
        isEditing={isEditing && !!selectedSector}
        onSelect={onSelectSector}
        onPlace={onPlacePoint}
      />
    </MapArea>
  );
};
