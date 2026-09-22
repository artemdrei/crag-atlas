import type { ComponentProps, PropsWithChildren } from 'react';

import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

export interface Props extends ComponentProps<typeof Stack> {
  /** Phones pad evenly; desktop pages get wider side gutters. */
  isCompact?: boolean;
  /** Pages whose body owns its own scrolling — the editors, the sector view. */
  isFixedHeight?: boolean;
}

/** The outer frame every route-level surface sits in, so page padding has one
    source rather than a copy per screen. */
export const PageShell = ({
  isCompact,
  isFixedHeight,
  children,
  ...props
}: PropsWithChildren<Props>) => (
  <ShellStyled
    isCompact={!!isCompact}
    isFixedHeight={!!isFixedHeight}
    {...props}
  >
    {children}
  </ShellStyled>
);

const ShellStyled = styled(Stack, {
  shouldForwardProp: (prop) => prop !== 'isCompact' && prop !== 'isFixedHeight'
})<{ isCompact: boolean; isFixedHeight: boolean }>`
  height: ${({ isFixedHeight }) => (isFixedHeight ? '100%' : 'auto')};
  overflow: ${({ isFixedHeight }) => (isFixedHeight ? 'hidden' : 'visible')};
  padding: ${({ theme, isCompact }) =>
    isCompact ? theme.spacing(2) : theme.spacing(2, 3, 3)};
`;
