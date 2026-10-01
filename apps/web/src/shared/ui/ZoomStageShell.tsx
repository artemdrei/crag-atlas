import type { PropsWithChildren } from 'react';

import { styled } from '@mui/material/styles';

export interface Props {
  className?: string;
}

// Stretches the library's own two elements, which only a descendant selector
// can reach.
export const ZoomStageShell = ({
  className,
  children
}: PropsWithChildren<Props>) => (
  <ShellStyled className={className}>{children}</ShellStyled>
);

const ShellStyled = styled('div')`
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;

  & .react-transform-wrapper,
  & .react-transform-component {
    width: 100%;
    height: 100%;
  }

  & .react-transform-component {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
