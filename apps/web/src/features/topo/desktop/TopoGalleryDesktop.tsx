import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { PhotoPlaceholder } from '@web/shared/ui';

import type { TopoGalleryProps } from '../common';
import {
  TopoThumbStrip,
  TopoZoomControls,
  TopoZoomStage,
  usePhotoLabel
} from '../common';

export const TopoGalleryDesktop = ({
  topos,
  idActiveTopo,
  idHighlightedRoute,
  colorOf,
  numberOf,
  tickedRoutes,
  onSelectTopo,
  onSelectRoute,
  onHoverRoute
}: TopoGalleryProps) => {
  const photoLabel = usePhotoLabel();
  const idxActiveTopo = topos.findIndex(({ id }) => id === idActiveTopo);
  const activeTopo = topos[idxActiveTopo];

  return (
    <GalleryStyled>
      {activeTopo ? (
        <ZoomStageStyled
          photoUrl={activeTopo.photoUrl}
          label={photoLabel(idxActiveTopo)}
          lines={activeTopo.lines}
          idHighlightedRoute={idHighlightedRoute}
          colorOf={colorOf}
          numberOf={numberOf}
          tickedRoutes={tickedRoutes}
          onSelectRoute={onSelectRoute}
          onHoverRoute={onHoverRoute}
          isTopAligned
        >
          <CaptionStyled variant="caption">
            {photoLabel(idxActiveTopo)}
          </CaptionStyled>
          <TopoZoomControls />
        </ZoomStageStyled>
      ) : (
        <PhotoPlaceholder variant="wide" />
      )}
      {topos.length > 1 && (
        <TopoThumbStrip
          topos={topos}
          idActiveTopo={idActiveTopo}
          onSelect={onSelectTopo}
        />
      )}
    </GalleryStyled>
  );
};

const GalleryStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
`;

const ZoomStageStyled = styled(TopoZoomStage)`
  flex-grow: 1;
  min-height: 0;
  padding: 0;
`;

const CaptionStyled = styled(Typography)`
  position: absolute;
  left: ${({ theme }) => theme.spacing(1.5)};
  bottom: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(0.5, 1.5)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  background: ${({ theme }) => theme.palette.background.paper};
  color: ${({ theme }) => theme.palette.text.secondary};
`;
