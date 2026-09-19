import type { ReactNode } from 'react';

import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  title: string;
  children: ReactNode;
}

export const PlaygroundSection = ({ title, children }: Props) => (
  <SectionStyled>
    <Typography variant="overline" color="text.secondary">
      {title}
    </Typography>
    <RowStyled>{children}</RowStyled>
  </SectionStyled>
);

const SectionStyled = styled('section')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2, 0)};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const RowStyled = styled('div')`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;
