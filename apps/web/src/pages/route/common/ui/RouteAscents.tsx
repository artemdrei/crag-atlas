import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import type { AscentStyle } from '@web/shared/ui';
import { AscentStyleBadge } from '@web/shared/ui';

interface Ascent {
  id: string;
  climber: string;
  climbedAt: string;
  ascentStyle: AscentStyle;
}

/** Demo data until the API serves the route's ascents. */
const DEMO_ASCENTS: Ascent[] = [
  {
    id: 'a1',
    climber: 'Maria S.',
    climbedAt: '2026-09-16',
    ascentStyle: 'redpoint'
  },
  {
    id: 'a2',
    climber: 'Oleh K.',
    climbedAt: '2026-09-11',
    ascentStyle: 'onsight'
  },
  {
    id: 'a3',
    climber: 'Ihor B.',
    climbedAt: '2026-09-02',
    ascentStyle: 'flash'
  }
];

export const RouteAscents = () => (
  <ListStyled>
    {DEMO_ASCENTS.map((ascent) => (
      <RowStyled key={ascent.id}>
        <Typography variant="body2">{ascent.climber}</Typography>
        <AscentStyleBadge ascentStyle={ascent.ascentStyle} />
        <Typography variant="caption" color="text.secondary">
          {ascent.climbedAt}
        </Typography>
      </RowStyled>
    ))}
  </ListStyled>
);

const ListStyled = styled('div')`
  display: flex;
  flex-direction: column;
`;

const RowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(1.5, 0)};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;
