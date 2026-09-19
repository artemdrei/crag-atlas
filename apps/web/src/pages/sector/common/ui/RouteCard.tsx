import CardActionArea from '@mui/material/CardActionArea';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { GradeBadge } from '@web/shared/ui';

import type { Route } from '../entities';

export interface Props {
  route: Route;
  onSelect: (route: Route) => void;
}

export const RouteCard = ({ route, onSelect }: Props) => (
  <CardAreaStyled onClick={() => onSelect(route)}>
    <HeaderRowStyled>
      <Typography variant="subtitle1" fontWeight={700}>
        {route.name}
      </Typography>
      <GradeBadge grade={route.grade} />
    </HeaderRowStyled>
    <Typography variant="body2" color="text.secondary">
      {route.description}
    </Typography>
    <FooterRowStyled>
      <Typography variant="caption" color="text.secondary">
        {route.type}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {route.length} m
      </Typography>
      {route.boltsCount > 0 && (
        <Typography variant="caption" color="text.secondary">
          {route.boltsCount} bolts
        </Typography>
      )}
    </FooterRowStyled>
  </CardAreaStyled>
);

const CardAreaStyled = styled(CardActionArea)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing(0.5)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  padding: ${({ theme }) => theme.spacing(1.5)};
`;

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const FooterRowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;
