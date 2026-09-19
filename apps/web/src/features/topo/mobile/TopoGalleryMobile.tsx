import { styled } from '@mui/material/styles';

import { PhotoPlaceholder } from '@web/shared/ui';

import type { TopoGalleryProps } from '../common';
import { TopoThumbStrip, TopoZoomStage } from '../common';

export const TopoGalleryMobile = ({
  topos,
  idActiveTopo,
  idHighlightedRoute,
  colorOf,
  onSelectTopo
}: TopoGalleryProps) => {
  const activeTopo = topos.find(({ id }) => id === idActiveTopo);

  return (
    <GalleryStyled>
      {activeTopo ? (
        <ZoomStageStyled
          topo={activeTopo}
          idHighlightedRoute={idHighlightedRoute}
          colorOf={colorOf}
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
