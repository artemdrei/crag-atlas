import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { ListSkeleton } from '@web/shared/ui';

import type { Route } from '../entities';
import type { RouteGroup } from '../hooks';
import { RouteCard } from './RouteCard';

export interface Props {
  groups: RouteGroup[];
  numberOf?: Record<string, number>;
  idHighlightedRoute?: string;
  tickedRoutes?: Set<string>;
  isLoading?: boolean;
  onOpen: (route: Route) => void;
  onHover?: (idRoute?: string) => void;
}

export const RoutesList = ({
  groups,
  numberOf,
  idHighlightedRoute,
  tickedRoutes,
  isLoading,
  onOpen,
  onHover
}: Props) => {
  if (isLoading) return <ListSkeleton count={8} variant="row" />;

  return (
    <ListStyled>
      {groups.map((group) => (
        <GroupStyled key={group.id}>
          {groups.length > 1 && (
            <LabelStyled variant="caption" color="text.secondary">
              {group.label}
            </LabelStyled>
          )}
          {group.routes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              number={numberOf?.[route.id]}
              isHighlighted={route.id === idHighlightedRoute}
              isTicked={tickedRoutes?.has(route.id)}
              onOpen={onOpen}
              onHover={onHover}
            />
          ))}
        </GroupStyled>
      ))}
    </ListStyled>
  );
};

const ListStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const GroupStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const LabelStyled = styled(Typography)`
  padding-bottom: ${({ theme }) => theme.spacing(0.5)};
`;
