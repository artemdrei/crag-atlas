import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import type { Tick } from '../entities';
import { TickCard } from './TickCard';
import { TicksSkeleton } from './TicksSkeleton';

export interface Props {
  ticks: Tick[];
  columns?: number;
  isCommunity?: boolean;
  isCompact?: boolean;
  isRouteHidden?: boolean;
  isLoading: boolean;
}

export const TicksList = ({
  ticks,
  columns = 1,
  isCommunity,
  isCompact,
  isRouteHidden,
  isLoading
}: Props) => {
  if (isLoading) return <TicksSkeleton />;

  if (ticks.length === 0) {
    return (
      <Typography color="text.secondary">
        <Trans>No ascents logged yet.</Trans>
      </Typography>
    );
  }

  return (
    <ListStyled columns={columns}>
      {ticks.map((tick) => (
        <TickCard
          key={tick.id}
          tick={tick}
          isCommunity={isCommunity}
          isCompact={isCompact}
          isRouteHidden={isRouteHidden}
        />
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
