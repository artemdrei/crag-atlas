import type { ReactNode } from 'react';

import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  icon: ReactNode;
  variant?: 'body2' | 'caption';
  isMuted?: boolean;
  children: ReactNode;
}

export const IconValue = ({
  icon,
  variant = 'body2',
  isMuted,
  children
}: Props) => (
  <RowStyled>
    {icon}
    <Typography
      variant={variant}
      color={isMuted ? 'text.secondary' : undefined}
    >
      {children}
    </Typography>
  </RowStyled>
);

const RowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;
