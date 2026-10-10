import type { PropsWithChildren, ReactNode } from 'react';

import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  label: ReactNode;
}

export const TickFormRow = ({ label, children }: PropsWithChildren<Props>) => (
  <RowStyled>
    <LabelStyled variant="body2" color="text.secondary">
      {label}
    </LabelStyled>
    {children}
  </RowStyled>
);

const RowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const LabelStyled = styled(Typography)`
  white-space: nowrap;
`;
