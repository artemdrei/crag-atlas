import type { ReactNode } from 'react';

import { styled } from '@mui/material/styles';

export interface Props {
  children: ReactNode;
}

export const FormActions = ({ children }: Props) => (
  <RowStyled>{children}</RowStyled>
);

const RowStyled = styled('div')`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
`;
