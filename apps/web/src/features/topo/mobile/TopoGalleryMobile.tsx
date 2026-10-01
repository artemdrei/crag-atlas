import { styled } from '@mui/material/styles';

import { PhotoPlaceholder } from '@web/shared/ui';

import type { TopoGalleryProps } from '../common';
import { TopoThumbStrip, TopoZoomStage, usePhotoLabel } from '../common';

export const TopoGalleryMobile = ({
  topos,
  idActiveTopo,
  idHighlightedRoute,
  colorOf,
  numberOf,
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
          onSelectRoute={onSelectRoute}
          onHoverRoute={onHoverRoute}
        />
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
  gap: ${({ theme }) => theme.spacing(1)};
`;

// Fixed, not content-sized: per-photo heights would move everything below.
const ZoomStageStyled = styled(TopoZoomStage)`
  height: 30svh;
`;
