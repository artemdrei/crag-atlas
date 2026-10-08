import { styled } from '@mui/material/styles';

import { PhotoPlaceholder, ZoomStageShell } from '@web/shared/ui';

import type { TopoGalleryProps } from '../common';
import {
  TopoExpandButton,
  TopoImage,
  TopoThumbStrip,
  useOpenTopoPhoto,
  usePhotoLabel
} from '../common';

export const TopoGalleryMobile = ({
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
  const openTopoPhoto = useOpenTopoPhoto();
  const photoLabel = usePhotoLabel();
  const idxActiveTopo = topos.findIndex(({ id }) => id === idActiveTopo);
  const activeTopo = topos[idxActiveTopo];

  const handleSelectPhoto = () =>
    openTopoPhoto({
      topo: activeTopo,
      label: photoLabel(idxActiveTopo),
      numberOf,
      tickedRoutes,
      colorOf
    });

  return (
    <GalleryStyled>
      {activeTopo ? (
        <StageStyled>
          <TopoImage
            photoUrl={activeTopo.photoUrl}
            label={photoLabel(idxActiveTopo)}
            lines={activeTopo.lines}
            idHighlightedRoute={idHighlightedRoute}
            colorOf={colorOf}
            numberOf={numberOf}
            tickedRoutes={tickedRoutes}
            onSelectRoute={onSelectRoute}
            onSelectPhoto={handleSelectPhoto}
            onHoverRoute={onHoverRoute}
            isTopAligned
          />
          <TopoExpandButton onClick={handleSelectPhoto} />
        </StageStyled>
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

const StageStyled = styled(ZoomStageShell)`
  height: 30svh;
  padding: 0;
`;
