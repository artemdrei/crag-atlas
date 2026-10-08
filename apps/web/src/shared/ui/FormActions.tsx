import type { ReactNode } from 'react';

import { styled } from '@mui/material/styles';

import { useIsInBottomSheet } from './BottomSheet';

export interface Props {
  children: ReactNode;
}

export const FormActions = ({ children }: Props) => (
  <RowStyled isStacked={useIsInBottomSheet()}>{children}</RowStyled>
);

// In a sheet the primary action, last in DOM order, lands on top.
const RowStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isStacked'
})<{ isStacked: boolean }>`
  display: flex;
  flex-direction: ${({ isStacked }) => (isStacked ? 'column-reverse' : 'row')};
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};

  ${({ isStacked, theme }) =>
    isStacked &&
    `
    & > * {
      width: 100%;
    }

    .MuiButton-root {
      padding: ${theme.spacing(1, 2.75)};
      font-size: ${theme.typography.pxToRem(15)};
    }
  `}
`;
