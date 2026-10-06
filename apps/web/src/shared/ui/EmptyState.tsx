import type { ReactNode } from 'react';

import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  icon: ReactNode;
  message: ReactNode;
  isLarge?: boolean;
}

export const EmptyState = ({ icon, message, isLarge = false }: Props) => (
  <EmptyStateStyled>
    <IconStyled isLarge={isLarge}>{icon}</IconStyled>
    <MessageStyled variant="body2">{message}</MessageStyled>
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

const IconStyled = styled('span', {
  shouldForwardProp: (prop) => prop !== 'isLarge'
})<{ isLarge: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ isLarge }) => (isLarge ? 96 : 56)}px;
  height: ${({ isLarge }) => (isLarge ? 96 : 56)}px;
  border-radius: 50%;
  color: ${({ theme }) => theme.palette.text.secondary};
  background-color: ${({ theme }) => alpha(theme.palette.text.secondary, 0.08)};

  svg {
    font-size: ${({ isLarge }) => (isLarge ? 56 : 28)}px;
  }
`;

const MessageStyled = styled(Typography)`
  max-width: 320px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;
