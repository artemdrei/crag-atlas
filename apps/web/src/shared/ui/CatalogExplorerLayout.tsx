import type { ReactNode } from 'react';

import { styled } from '@mui/material/styles';

export interface Props {
  search: ReactNode;
  list: ReactNode;
  map: ReactNode;
  aside?: ReactNode;
}

export const CatalogExplorerLayout = ({ search, list, map, aside }: Props) => (
  <LayoutStyled hasAside={!!aside}>
    <ColumnStyled>
      {search}
      <ListStyled>{list}</ListStyled>
    </ColumnStyled>
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

// No gap: the search field reserves a line for its hint, and that line is the
// space above the rule already.
const ColumnStyled = styled('div')`
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const ListStyled = styled('div')`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding-top: ${({ theme }) => theme.spacing(2)};
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
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
