import type { PropsWithChildren } from 'react';

import { styled } from '@mui/material/styles';

import { CONTROL_RADIUS } from '@web/shared/theme/theme';

export interface Props {
  className?: string;
}

export const ControlTrack = ({
  className,
  children
}: PropsWithChildren<Props>) => (
  <TrackStyled className={className}>{children}</TrackStyled>
);

const TrackStyled = styled('div')`
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => theme.spacing(0.5)};
  border-radius: ${CONTROL_RADIUS}px;
  background: ${({ theme }) => theme.palette.action.hover};
`;
