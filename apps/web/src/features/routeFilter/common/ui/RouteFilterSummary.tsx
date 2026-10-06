import type { ReactNode } from 'react';

import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { TickProgress } from '@web/shared/ui';

export interface Props {
  title: ReactNode;
  routesCount: number;
  tickedCount?: number;
  action: ReactNode;
}

export const RouteFilterSummary = ({
  title,
  routesCount,
  tickedCount,
  action
}: Props) => (
  <TitleRowStyled>
    <TitleStyled variant="subtitle1" noWrap aria-live="polite">
      {title}
    </TitleStyled>
    {tickedCount !== undefined && (
      <ProgressStyled tickedCount={tickedCount} routesCount={routesCount} />
    )}
    {action}
  </TitleRowStyled>
);

const TitleRowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const TitleStyled = styled(Typography)`
  flex: 1 1 auto;
  min-width: 0;
`;

const ProgressStyled = styled(TickProgress)`
  flex: none;
  width: 90px;
`;
