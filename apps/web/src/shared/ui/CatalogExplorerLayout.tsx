import type { ReactNode } from 'react';

import { styled } from '@mui/material/styles';

export interface Props {
  list: ReactNode;
  map: ReactNode;
  aside?: ReactNode;
}

export const CatalogExplorerLayout = ({ list, map, aside }: Props) => (
  <LayoutStyled hasAside={!!aside}>
    <ListStyled>{list}</ListStyled>
    <MapAreaStyled>{map}</MapAreaStyled>
    {aside && <SideStyled>{aside}</SideStyled>}
  </LayoutStyled>
);

const LayoutStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'hasAside'
})<{ hasAside: boolean }>`
  display: grid;
  grid-template-columns: ${({ hasAside }) =>
    hasAside ? '460px minmax(0, 1fr) 400px' : '460px minmax(0, 1fr)'};
  gap: ${({ theme }) => theme.spacing(2)};
  flex: 1;
  min-height: 0;
`;

// Anchoring would hold a card below in place and slide the filters above it
// away from the pointer as the list narrows.
const ListStyled = styled('div')`
  min-height: 0;
  overflow-y: auto;
  overflow-anchor: none;
`;

const MapAreaStyled = styled('div')`
  position: relative;
  min-height: 0;
`;

const SideStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: 0;
  overflow-y: auto;
`;
