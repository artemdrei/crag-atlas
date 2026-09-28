import { useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';

import { useModal } from '@web/app/providers';
import { PhotoPlaceholder } from '@web/shared/ui';

import type { TopoGalleryProps } from '../common';
import { TopoImage, TopoThumbStrip, usePhotoLabel } from '../common';

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
  const { t } = useLingui();
  const { openModal } = useModal();
  const photoLabel = usePhotoLabel();
  const idxActiveTopo = topos.findIndex(({ id }) => id === idActiveTopo);
  const activeTopo = topos[idxActiveTopo];

  const openPhoto = () => {
    if (!activeTopo) return;

    openModal('VIEW_TOPO_PHOTO', {
      photoUrl: activeTopo.photoUrl,
      label: photoLabel(idxActiveTopo),
      lines: activeTopo.lines,
      numberOf,
      colorOf
    });
  };

  return (
    <GalleryStyled>
      {activeTopo ? (
        <PhotoFrameStyled>
          <PhotoButtonStyled
            type="button"
            aria-label={t`Open the photo`}
            onClick={openPhoto}
          >
            <TopoImage
              photoUrl={activeTopo.photoUrl}
              label={photoLabel(idxActiveTopo)}
              lines={activeTopo.lines}
              idHighlightedRoute={idHighlightedRoute}
              isContained
              colorOf={colorOf}
              numberOf={numberOf}
              onSelectRoute={onSelectRoute}
              onHoverRoute={onHoverRoute}
            />
          </PhotoButtonStyled>
        </PhotoFrameStyled>
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

// Fixed, not content-sized: the photos have different shapes, and a section
// that took each one's height would move everything below it on every switch.
// The photo fits inside this rather than setting it.
const PhotoFrameStyled = styled('div')`
  --topo-stage-height: 30svh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  height: var(--topo-stage-height);
`;

const PhotoButtonStyled = styled('button')`
  display: flex;
  align-items: flex-start;
  max-width: 100%;
  padding: 0;
  cursor: zoom-in;
  border: none;
  background: none;
`;
