import type { ReactNode } from 'react';

import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  icon: ReactNode;
  message: ReactNode;
  action?: ReactNode;
}

export const EmptyState = ({ icon, message, action }: Props) => (
  <EmptyStateStyled>
    <IconStyled>{icon}</IconStyled>
    <MessageStyled variant="body2">{message}</MessageStyled>
    {action}
  </EmptyStateStyled>
);

const EmptyStateStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(5, 2)};
  text-align: center;
`;

const IconStyled = styled('span')`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  color: ${({ theme }) => theme.palette.text.secondary};
  background-color: ${({ theme }) => alpha(theme.palette.text.secondary, 0.08)};

  svg {
    font-size: 28px;
  }
`;

const MessageStyled = styled(Typography)`
  max-width: 320px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;
