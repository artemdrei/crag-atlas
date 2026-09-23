import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { GradeBadge } from '@web/shared/ui';

import type { TickHeader } from '../entities';

export type Props = TickHeader;

export const TickFormHeader = ({
  routeName,
  routeGrade,
  routeGradeScale,
  place
}: Props) => (
  <HeaderStyled>
    {routeGrade && <GradeBadge grade={routeGrade} scale={routeGradeScale} />}
    <div>
      <Typography variant="h6">{routeName}</Typography>
      {place && (
        <Typography variant="body2" color="text.secondary">
          {place}
        </Typography>
      )}
    </div>
  </HeaderStyled>
);

const HeaderStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;
