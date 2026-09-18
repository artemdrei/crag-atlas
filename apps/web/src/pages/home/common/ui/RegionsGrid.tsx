import { styled } from '@mui/material/styles';

import type { Region } from '../entities';
import { RegionCard } from './RegionCard';

export interface Props {
  regions: Region[];
  onSelect: (region: Region) => void;
}

export const RegionsGrid = ({ regions, onSelect }: Props) => (
  <GridStyled>
    {regions.map((region) => (
      <RegionCard key={region.id} region={region} onSelect={onSelect} />
    ))}
  </GridStyled>
);

const GridStyled = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing(2)};
`;
