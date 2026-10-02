import type { ComponentProps, PropsWithChildren, ReactNode } from 'react';

import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

export interface Props extends ComponentProps<typeof Stack> {
  header?: ReactNode;
  isCompact?: boolean;
  isFixedHeight?: boolean;
}

export const PageShell = ({
  header,
  isCompact,
  isFixedHeight,
  children,
  ...props
}: PropsWithChildren<Props>) => {
  const content = (
    <ShellStyled
      isCompact={!!isCompact}
      isFixedHeight={!!isFixedHeight}
      {...props}
    >
      {children}
    </ShellStyled>
  );

  if (!header) return content;

  return (
    <div>
      <HeaderSlotStyled isCompact={!!isCompact}>{header}</HeaderSlotStyled>
      {content}
    </div>
  );
};

const ShellStyled = styled(Stack, {
  shouldForwardProp: (prop) => prop !== 'isCompact' && prop !== 'isFixedHeight'
})<{ isCompact: boolean; isFixedHeight: boolean }>`
  height: ${({ isFixedHeight }) => (isFixedHeight ? '100%' : 'auto')};
  overflow: ${({ isFixedHeight }) => (isFixedHeight ? 'hidden' : 'visible')};
  padding: ${({ theme, isCompact }) =>
    isCompact ? theme.spacing(2) : theme.spacing(2, 3, 3)};
`;

const HeaderSlotStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isCompact'
})<{ isCompact: boolean }>`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.appBar};
  padding: ${({ theme, isCompact }) =>
    isCompact ? theme.spacing(0, 2, 1) : theme.spacing(0, 3, 1)};
  background-color: ${({ theme }) => theme.palette.background.default};
`;
