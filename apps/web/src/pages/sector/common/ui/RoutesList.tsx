import { styled } from '@mui/material/styles';

import type { Route } from '../entities';
import { RouteCard } from './RouteCard';

export interface Props {
  routes: Route[];
  onSelect: (route: Route) => void;
}

export const RoutesList = ({ routes, onSelect }: Props) => (
  <ListStyled>
    {routes.map((route) => (
      <RouteCard key={route.id} route={route} onSelect={onSelect} />
    ))}
  </ListStyled>
);

const ListStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;
