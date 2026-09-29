import { type ReactNode, type RefObject, useRef, useState } from 'react';
import {
  type ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper
} from 'react-zoom-pan-pinch';

import { Trans, useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { TopoZoomControls } from '@web/features/topo';
import { formatBytes } from '@web/shared/lib';
import { photoFrame } from '@web/shared/theme/photoFrame';

import type { PhotoVersion } from '../../common';
import { STAGE_HEIGHT, squareStage } from './stage';

interface ViewTransform {
  scale: number;
  positionX: number;
  positionY: number;
}

const MIN_SCALE = 1;
const MAX_SCALE = 8;

export interface Props {
  original: PhotoVersion;
  compressed: PhotoVersion;
}

export const PhotoCompare = ({ original, compressed }: Props) => {
  const { t } = useLingui();
  const [isZoomed, setIsZoomed] = useState(false);
  const originalRef = useRef<ReactZoomPanPinchRef>(null);
  const compressedRef = useRef<ReactZoomPanPinchRef>(null);
  // Mirroring a transform transforms the other pane, which would mirror back.
  const isMirroring = useRef(false);

  const mirror = (
    from: RefObject<ReactZoomPanPinchRef | null>,
    { scale, positionX, positionY }: ViewTransform
  ) => {
    setIsZoomed(scale > MIN_SCALE);

    const target =
      from === originalRef ? compressedRef.current : originalRef.current;

    if (!target || isMirroring.current) return;

    isMirroring.current = true;
    target.setTransform(positionX, positionY, scale, 0);
    requestAnimationFrame(() => {
      isMirroring.current = false;
    });
  };

  return (
    <RegionStyled>
      <HintStyled variant="caption" color="text.secondary">
        <Trans>
          Pinch or double-click to zoom — both panes follow the same view.
        </Trans>
      </HintStyled>
      <PairStyled>
        <ComparePane
          title={<Trans>Original</Trans>}
          alt={t`Original photo`}
          version={original}
          isZoomed={isZoomed}
          paneRef={originalRef}
          onTransform={(state) => mirror(originalRef, state)}
        />
        <ComparePane
          title={<Trans>Compressed</Trans>}
          alt={t`Compressed photo`}
          version={compressed}
          hasControls
          isZoomed={isZoomed}
          paneRef={compressedRef}
          onTransform={(state) => mirror(compressedRef, state)}
        />
      </PairStyled>
    </RegionStyled>
  );
};

interface ComparePaneProps {
  alt: string;
  title: ReactNode;
  version: PhotoVersion;
  hasControls?: boolean;
  isZoomed: boolean;
  paneRef: RefObject<ReactZoomPanPinchRef | null>;
  onTransform: (state: ViewTransform) => void;
}

const ComparePane = ({
  alt,
  title,
  version,
  hasControls,
  isZoomed,
  paneRef,
  onTransform
}: ComparePaneProps) => {
  const { i18n } = useLingui();

  return (
    <PaneStyled>
      <Typography variant="subtitle2">{title}</Typography>
      <ViewportStyled>
        <TransformWrapper
          ref={paneRef}
          minScale={MIN_SCALE}
          maxScale={MAX_SCALE}
          centerOnInit
          doubleClick={{ mode: 'toggle' }}
          wheel={{ wheelDisabled: true }}
          panning={{ disabled: !isZoomed }}
          trackPadPanning={{ disabled: !isZoomed }}
          onTransform={(_ref, state) => onTransform(state)}
        >
          <TransformComponent>
            <ImageStyled src={version.url} alt={alt} />
          </TransformComponent>
          {hasControls && <TopoZoomControls />}
        </TransformWrapper>
      </ViewportStyled>
      <Typography variant="caption" color="text.secondary">
        {formatBytes(version.bytes, i18n.locale)} · {version.width}×
        {version.height}
      </Typography>
    </PaneStyled>
  );
};

const RegionStyled = styled('div')`
  display: flex;
  flex-direction: column;
  height: ${STAGE_HEIGHT};
`;

const HintStyled = styled(Typography)`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const PairStyled = styled('div')`
  display: flex;
  flex: 1 1 auto;
  gap: ${({ theme }) => theme.spacing(1.5)};
  min-height: 0;
`;

const PaneStyled = styled('div')`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  /* Without this a wide photo stretches the flex item past its share. */
  min-width: 0;
  height: 100%;
`;

const OTHER_ROWS = '78px';

const ViewportStyled = styled('div')`
  position: relative;
  ${squareStage(OTHER_ROWS)}
  overflow: hidden;
  background: ${({ theme }) => theme.palette.action.hover};
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

const ImageStyled = styled('img')`
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  ${({ theme }) => photoFrame(theme)}
`;
