import { styled } from '@mui/material/styles';

import type { Region } from '../entities';
import { RegionCard } from './RegionCard';

export interface Props {
  regions: Region[];
  idSelectedRegion?: string;
  columns?: number;
  onSelect: (region: Region) => void;
}

export const RegionsGrid = ({
  regions,
  idSelectedRegion,
  columns = 1,
  onSelect
}: Props) => (
  <GridStyled columns={columns}>
    {regions.map((region) => (
      <RegionCard
        key={region.id}
        region={region}
        isSelected={region.id === idSelectedRegion}
        onSelect={onSelect}
      />
    ))}
  </GridStyled>
);

const GridStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'columns'
})<{ columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns}, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing(2)};
`;
