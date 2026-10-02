import type { ComponentProps } from 'react';

import { styled } from '@mui/material/styles';

export const PageTitleRow = (props: ComponentProps<'div'>) => (
  <RowStyled {...props} />
);

const RowStyled = styled('div')`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1.5)};

  & > *:first-of-type {
    min-width: 0;
  }

  & > *:last-child {
    flex: none;
  }
`;
