import { styled } from '@mui/material/styles';

import type { Sector } from '../entities';
import { SectorCard } from './SectorCard';

export interface Props {
  sectors: Sector[];
  idSelectedSector?: string;
  /** The card whose form holds edits nobody saved yet. */
  idDirtySector?: string;
  columns?: number;
  onSelect: (sector: Sector) => void;
}

export const SectorsList = ({
  sectors,
  idSelectedSector,
  idDirtySector,
  columns = 1,
  onSelect
}: Props) => (
  <ListStyled columns={columns}>
    {sectors.map((sector) => (
      <SectorCard
        key={sector.id}
        sector={sector}
        isSelected={sector.id === idSelectedSector}
        isUnsaved={sector.id === idDirtySector}
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
