import { styled } from '@mui/material/styles';

import type { Region } from '../entities';
import { RegionCard } from './RegionCard';

export interface Props {
  regions: Region[];
  idSelectedRegion?: string;
  /** The card whose form holds edits nobody saved yet. */
  idDirtyRegion?: string;
  onSelect: (region: Region) => void;
  onShowOnMap?: (region: Region) => void;
  onEdit?: (region: Region) => void;
}

export const RegionsGrid = ({
  regions,
  idSelectedRegion,
  idDirtyRegion,
  onSelect,
  onShowOnMap,
  onEdit
}: Props) => (
  <GridStyled>
    {regions.map((region) => (
      <RegionCard
        key={region.id}
        region={region}
        isSelected={region.id === idSelectedRegion}
        isUnsaved={region.id === idDirtyRegion}
        onSelect={onSelect}
        onShowOnMap={onShowOnMap}
        onEdit={onEdit}
      />
    ))}
  </GridStyled>
);

const GridStyled = styled('div')`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(2)};
`;
