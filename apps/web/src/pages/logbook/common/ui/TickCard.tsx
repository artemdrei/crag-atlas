import { Trans } from '@lingui/react/macro';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { AscentStyleLabel, GradeBadge } from '@web/shared/ui';

import type { Tick } from '../entities';

export interface Props {
  tick: Tick;
}

export const TickCard = ({ tick }: Props) => (
  <CardStyled elevation={0}>
    <HeaderRowStyled>
      <TitleGroupStyled>
        <Typography variant="subtitle1" fontWeight={700}>
          {tick.routeName ?? tick.idRoute}
        </Typography>
        {tick.routeGrade && <GradeBadge grade={tick.routeGrade} />}
      </TitleGroupStyled>
      <Chip
        size="small"
        label={<AscentStyleLabel ascentStyle={tick.ascentStyle} />}
      />
    </HeaderRowStyled>

    {tick.sectorName && (
      <Typography variant="body2" color="text.secondary">
        {tick.sectorName}
      </Typography>
    )}

    <Typography variant="body2" color="text.secondary">
      {tick.climbedAt}
      {tick.attempts ? (
        <>
          {' · '}
          <Trans>{tick.attempts} attempts</Trans>
        </>
      ) : null}
    </Typography>

    {tick.note && <Typography variant="body2">{tick.note}</Typography>}
  </CardStyled>
);

const CardStyled = styled(Paper)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => theme.spacing(1.5, 2)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const TitleGroupStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;
