import type { PropsWithChildren } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import type { Topo } from '@crag-atlas/api';
import { styled } from '@mui/material/styles';

import { TopoImage } from './TopoImage';

export interface Props {
  topo: Topo;
  idHighlightedRoute?: string;
  colorOf?: (idRoute: string) => string | undefined;
  className?: string;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;

export const TopoZoomStage = ({
  topo,
  idHighlightedRoute,
  colorOf,
  className,
  children
}: PropsWithChildren<Props>) => (
  <StageStyled className={className}>
    <TransformWrapper
      key={topo.id}
      minScale={MIN_SCALE}
      maxScale={MAX_SCALE}
      centerOnInit
      doubleClick={{ mode: 'toggle' }}
    >
      <TransformComponent>
        <TopoImage
          topo={topo}
          idHighlightedRoute={idHighlightedRoute}
          isContained
          colorOf={colorOf}
        />
      </TransformComponent>
      {children}
    </TransformWrapper>
  </StageStyled>
);

const StageStyled = styled('div')`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;

  /* The zoom layer is the library's markup; it has to fill the stage. */
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
