import { styled } from '@mui/material/styles';

import type { Route } from '../entities';
import { RouteCard } from './RouteCard';

export interface Props {
  routes: Route[];
  idHighlightedRoute?: string;
  onOpen: (route: Route) => void;
  onHover?: (route?: Route) => void;
}

export const RoutesList = ({
  routes,
  idHighlightedRoute,
  onOpen,
  onHover
}: Props) => (
  <ListStyled>
    {routes.map((route, index) => (
      <RouteCard
        key={route.id}
        route={route}
        index={index}
        isHighlighted={route.id === idHighlightedRoute}
        onOpen={onOpen}
        onHover={onHover}
      />
    ))}
  </ListStyled>
);

const ListStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;
