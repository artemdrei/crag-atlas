import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import type { Tick } from '../entities';
import { TickCard } from './TickCard';

export interface Props {
  ticks: Tick[];
  isLoading: boolean;
}

export const TicksList = ({ ticks, isLoading }: Props) => {
  if (!isLoading && ticks.length === 0) {
    return (
      <Typography color="text.secondary">
        <Trans>No ascents logged yet.</Trans>
      </Typography>
    );
  }

  return (
    <ListStyled>
      {ticks.map((tick) => (
        <TickCard key={tick.id} tick={tick} />
      ))}
    </ListStyled>
  );
};

const ListStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;
