import { type PropsWithChildren, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import type { RouteLine } from '@crag-atlas/api';
import { styled } from '@mui/material/styles';

import { TopoImage } from './TopoImage';

export interface Props {
  photoUrl: string;
  label: string;
  lines: RouteLine[];
  idHighlightedRoute?: string;
  colorOf?: (idRoute: string) => string | undefined;
  numberOf?: Record<string, number>;
  onSelectRoute?: (idRoute: string) => void;
  onHoverRoute?: (idRoute?: string) => void;
  className?: string;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;

export const TopoZoomStage = ({
  photoUrl,
  label,
  lines,
  idHighlightedRoute,
  colorOf,
  numberOf,
  onSelectRoute,
  onHoverRoute,
  className,
  children
}: PropsWithChildren<Props>) => {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <StageStyled className={className}>
      <TransformWrapper
        key={photoUrl}
        minScale={MIN_SCALE}
        maxScale={MAX_SCALE}
        centerOnInit
        doubleClick={{ mode: 'toggle' }}
        // A plain scroll belongs to the page; only a pinch (ctrl+wheel on a
        // trackpad) zooms, and dragging pans only once the topo is zoomed in.
        wheel={{ wheelDisabled: true }}
        panning={{ disabled: !isZoomed }}
        trackPadPanning={{ disabled: !isZoomed }}
        onTransform={(_ref, state) => setIsZoomed(state.scale > MIN_SCALE)}
      >
        <TransformComponent>
          <TopoImage
            photoUrl={photoUrl}
            label={label}
            lines={lines}
            idHighlightedRoute={idHighlightedRoute}
            isContained
            colorOf={colorOf}
            numberOf={numberOf}
            onSelectRoute={onSelectRoute}
            onHoverRoute={onHoverRoute}
          />
        </TransformComponent>
        {children}
      </TransformWrapper>
    </StageStyled>
  );
};

const StageStyled = styled('div')`
  position: relative;
  display: flex;
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
