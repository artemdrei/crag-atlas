import type { MouseEvent, ReactNode } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';

export interface Props {
  icon?: ReactNode;
  label: ReactNode;
  isActive: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

export const FilterPill = ({ icon, label, isActive, onClick }: Props) => (
  <PillStyled
    isActive={isActive}
    startIcon={icon}
    endIcon={<ExpandMoreIcon fontSize="small" />}
    onClick={onClick}
  >
    {label}
  </PillStyled>
);

const PillStyled = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isActive'
})<{ isActive: boolean }>`
  flex: 0 0 auto;
  border-radius: 999px;
  padding: ${({ theme }) => theme.spacing(0.75, 1.5)};
  white-space: nowrap;
  color: ${({ theme, isActive }) =>
    isActive ? theme.palette.primary.main : theme.palette.text.primary};
  background: ${({ theme, isActive }) =>
    isActive
      ? alpha(theme.palette.primary.main, 0.12)
      : theme.palette.action.hover};
`;
