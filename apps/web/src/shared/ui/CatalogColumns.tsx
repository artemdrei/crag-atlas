import type { PropsWithChildren } from 'react';

import { styled } from '@mui/material/styles';

export interface Props {
  /** The edit sidebar shares the row with the cards instead of covering them. */
  isEditing?: boolean;
}

/** The card grid of a catalog screen, beside its edit sidebar when one is open. */
export const CatalogColumns = ({
  isEditing,
  children
}: PropsWithChildren<Props>) => (
  <ColumnsStyled isEditing={!!isEditing}>{children}</ColumnsStyled>
);

const ColumnsStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isEditing'
})<{ isEditing: boolean }>`
  display: grid;
  grid-template-columns: ${({ isEditing }) =>
    isEditing ? 'minmax(0, 1fr) 360px' : 'minmax(0, 1fr)'};
  gap: ${({ theme }) => theme.spacing(3)};
  align-items: start;
  /* The header rows sit close together; the cards need air under them. */
  padding-top: ${({ theme }) => theme.spacing(1)};
`;
