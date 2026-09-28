import type { ReactNode } from 'react';

import { styled } from '@mui/material/styles';

export interface Props {
  children: ReactNode;
}

export const MapArea = ({ children }: Props) => (
  <AreaStyled>{children}</AreaStyled>
);

const AreaStyled = styled('div')`
  position: relative;
  height: 100%;
  min-height: 220px;
`;
