import type { VideoRoute } from '@crag-atlas/api';
import { Trans } from '@lingui/react/macro';
import CheckIcon from '@mui/icons-material/Check';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { RouteOption } from './RouteOption';

export interface Props {
  routes: VideoRoute[];
  idSelected?: string;
  hasTerm: boolean;
  isLoading: boolean;
  onPick: (route: VideoRoute) => void;
}

export const RouteOptionList = ({
  routes,
  idSelected,
  hasTerm,
  isLoading,
  onPick
}: Props) => {
  if (!hasTerm || isLoading) return null;

  if (routes.length === 0) {
    return (
      <EmptyStyled variant="body2" color="text.secondary">
        <Trans>No routes found</Trans>
      </EmptyStyled>
    );
  }

  return (
    <List dense disablePadding>
      {routes.map((route) => (
        <ItemStyled
          key={route.idRoute}
          selected={route.idRoute === idSelected}
          onClick={() => onPick(route)}
        >
          <RouteOption route={route} />
          {route.idRoute === idSelected && (
            <CheckIcon fontSize="small" color="primary" />
          )}
        </ItemStyled>
      ))}
    </List>
  );
};

const ItemStyled = styled(ListItemButton)`
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const EmptyStyled = styled(Typography)`
  padding: ${({ theme }) => theme.spacing(1, 2)};
`;
