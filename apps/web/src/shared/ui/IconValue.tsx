import type { ReactNode } from 'react';

import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

export interface Props {
  icon: ReactNode;
  hint?: string;
  variant?: 'body2' | 'caption';
  isMuted?: boolean;
  children: ReactNode;
}

export const IconValue = ({
  icon,
  hint,
  variant = 'body2',
  isMuted,
  children
}: Props) => {
  const row = (
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

  return hint ? <Tooltip title={hint}>{row}</Tooltip> : row;
};

const RowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;
