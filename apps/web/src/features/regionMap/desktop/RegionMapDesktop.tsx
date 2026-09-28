import type { Region } from '@crag-atlas/api';
import { useTheme } from '@mui/material/styles';

import type { Coords } from '@web/shared/types';
import { MapArea, MapCanvas } from '@web/shared/ui';

import type { MappedRegion } from '../common';
import { REGION_ZOOM, RegionPointCard, regionMapPoints } from '../common';

const ID_DRAFT = 'draft';

export interface Props {
  mapped: MappedRegion[];
  selectedRegion?: Region;
  draftPoint?: Coords;
  isEditing?: boolean;
  onOpenRegion: (idRegion: string) => void;
  onSelectRegion: (idRegion: string) => void;
  onPlacePoint: (point: Coords) => void;
}

export const RegionMapDesktop = ({
  mapped,
  selectedRegion,
  draftPoint,
  isEditing,
  onOpenRegion,
  onSelectRegion,
  onPlacePoint
}: Props) => {
  const theme = useTheme();

  return (
    <MapArea>
      <MapCanvas
        points={[
          ...regionMapPoints(mapped, theme.palette.primary.main),
          // A region being created is not in the catalog yet, so its point
          // has nothing to hang on until it is saved.
          ...(isEditing && draftPoint && !selectedRegion
            ? [
                {
                  id: ID_DRAFT,
                  point: draftPoint,
                  color: theme.palette.secondary.main
                }
              ]
            : [])
        ]}
        details={
          selectedRegion &&
          !isEditing && (
            <RegionPointCard
              region={selectedRegion}
              onOpen={() => onOpenRegion(selectedRegion.id)}
            />
          )
        }
        idSelected={selectedRegion?.id}
        selectedZoom={REGION_ZOOM}
        isEditing={isEditing}
        onSelect={onSelectRegion}
        onPlace={onPlacePoint}
      />
    </MapArea>
  );
};
