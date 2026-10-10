import type { PropsWithChildren, ReactNode } from 'react';

import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  title: ReactNode;
  hasDivider?: boolean;
}

export const TickFormSection = ({
  title,
  hasDivider,
  children
}: PropsWithChildren<Props>) => (
  <SectionStyled>
    {hasDivider && <Divider />}
    <Typography variant="subtitle1">{title}</Typography>
    {children}
  </SectionStyled>
);

const SectionStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;
