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
    <TitleGroupStyled>
      <TitleStyled variant="subtitle1" noWrap aria-live="polite">
        {title}
      </TitleStyled>
      {tickedCount !== undefined && (
        <ProgressStyled tickedCount={tickedCount} routesCount={routesCount} />
      )}
    </TitleGroupStyled>
    {action}
  </TitleRowStyled>
);

const TitleRowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const TitleGroupStyled = styled('div')`
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  min-width: 0;
`;

const TitleStyled = styled(Typography)`
  flex: 0 1 auto;
  min-width: 0;
`;

const ProgressStyled = styled(TickProgress)`
  flex: none;
  width: 80px;

  & .MuiLinearProgress-root {
    top: 0;
    height: 6px;
    border-radius: 3px;
  }

  & .MuiLinearProgress-bar {
    border-radius: 3px;
  }
`;
