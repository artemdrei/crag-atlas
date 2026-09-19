import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { GradeBadge } from '@web/shared/ui';

import type { Route } from '../entities';

export interface Props {
  route: Route;
}

export const RouteDetails = ({ route }: Props) => (
  <ContainerStyled>
    <HeaderRowStyled>
      <Typography variant="h4">{route.name}</Typography>
      <GradeBadge grade={route.grade} />
    </HeaderRowStyled>
    <StatsRowStyled>
      <Typography variant="body2" color="text.secondary">
        {route.type}
      </Typography>
      {!!route.length && (
        <Typography variant="body2" color="text.secondary">
          {route.length} m
        </Typography>
      )}
      {!!route.boltsCount && (
        <Typography variant="body2" color="text.secondary">
          {route.boltsCount} bolts
        </Typography>
      )}
    </StatsRowStyled>
    <Typography variant="body1">{route.description}</Typography>
  </ContainerStyled>
);

const ContainerStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const StatsRowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;
