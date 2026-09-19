import type { ReactNode } from 'react';

import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  label: ReactNode;
  children: ReactNode;
}

export const ProfileSettingRow = ({ label, children }: Props) => (
  <RowStyled elevation={0}>
    <Typography variant="body1">{label}</Typography>
    {children}
  </RowStyled>
);

const RowStyled = styled(Paper)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  padding: ${({ theme }) => theme.spacing(1.5, 2)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;
