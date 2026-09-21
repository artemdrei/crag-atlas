import { styled } from '@mui/material/styles';

import type { Sector } from '../entities';
import { SectorCard } from './SectorCard';

export interface Props {
  sectors: Sector[];
  idSelectedSector?: string;
  columns?: number;
  onSelect: (sector: Sector) => void;
}

export const SectorsList = ({
  sectors,
  idSelectedSector,
  columns = 1,
  onSelect
}: Props) => (
  <ListStyled columns={columns}>
    {sectors.map((sector) => (
      <SectorCard
        key={sector.id}
        sector={sector}
        isSelected={sector.id === idSelectedSector}
        onSelect={onSelect}
      />
    ))}
  </ListStyled>
);

const ListStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'columns'
})<{ columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns}, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing(1.5)};
`;
