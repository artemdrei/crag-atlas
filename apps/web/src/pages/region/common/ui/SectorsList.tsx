import { styled } from '@mui/material/styles';

import type { Sector } from '../entities';
import { SectorCard } from './SectorCard';

export interface Props {
  sectors: Sector[];
  onSelect: (sector: Sector) => void;
}

export const SectorsList = ({ sectors, onSelect }: Props) => (
  <ListStyled>
    {sectors.map((sector) => (
      <SectorCard key={sector.id} sector={sector} onSelect={onSelect} />
    ))}
  </ListStyled>
);

const ListStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;
