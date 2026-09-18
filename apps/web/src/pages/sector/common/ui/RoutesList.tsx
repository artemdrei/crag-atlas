import { styled } from '@mui/material/styles';

import type { Route } from '../entities';
import { RouteCard } from './RouteCard';

export interface Props {
  routes: Route[];
}

export const RoutesList = ({ routes }: Props) => (
  <ListStyled>
    {routes.map((route) => (
      <RouteCard key={route.id} route={route} />
    ))}
  </ListStyled>
);

const ListStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;
