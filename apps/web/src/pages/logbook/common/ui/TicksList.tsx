import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import type { Tick } from '../entities';
import { TickCard } from './TickCard';

export interface Props {
  ticks: Tick[];
  columns?: number;
  isLoading: boolean;
}

export const TicksList = ({ ticks, columns = 1, isLoading }: Props) => {
  if (!isLoading && ticks.length === 0) {
    return (
      <Typography color="text.secondary">
        <Trans>No ascents logged yet.</Trans>
      </Typography>
    );
  }

  return (
    <ListStyled columns={columns}>
      {ticks.map((tick) => (
        <TickCard key={tick.id} tick={tick} />
      ))}
    </ListStyled>
  );
};

const ListStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'columns'
})<{ columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns}, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing(2.5)};
  align-items: start;
`;
