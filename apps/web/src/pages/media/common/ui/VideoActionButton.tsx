import type { ReactNode } from 'react';

import IconButton from '@mui/material/IconButton';
import { alpha, styled } from '@mui/material/styles';

export interface Props {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

export const VideoActionButton = ({ label, icon, onClick }: Props) => (
  <ButtonStyled size="small" aria-label={label} onClick={onClick}>
    {icon}
  </ButtonStyled>
);

const ButtonStyled = styled(IconButton)`
  color: ${({ theme }) => theme.palette.common.white};
  background: ${({ theme }) => alpha(theme.palette.common.black, 0.55)};

  &:hover {
    background: ${({ theme }) => alpha(theme.palette.common.black, 0.75)};
  }
`;
