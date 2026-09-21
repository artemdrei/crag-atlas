import { styled } from '@mui/material/styles';

import { PhotoPlaceholder } from '@web/shared/ui';

import type { TopoGalleryProps } from '../common';
import { TopoThumbStrip, TopoZoomStage } from '../common';

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
  const activeTopo = topos.find(({ id }) => id === idActiveTopo);

  return (
    <GalleryStyled>
      {activeTopo ? (
        <ZoomStageStyled
          photoUrl={activeTopo.photoUrl}
          label={activeTopo.label}
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

const ZoomStageStyled = styled(TopoZoomStage)`
  height: 50svh;
`;
