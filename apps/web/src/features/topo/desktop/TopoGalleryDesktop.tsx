import { useControls } from 'react-zoom-pan-pinch';

import { useLingui } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { PhotoPlaceholder } from '@web/shared/ui';

import type { TopoGalleryProps } from '../common';
import { TopoThumbStrip, TopoZoomStage } from '../common';

export const TopoGalleryDesktop = ({
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
        >
          <CaptionStyled variant="caption">{activeTopo.label}</CaptionStyled>
          <ZoomControls />
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

const ZoomControls = () => {
  const { t } = useLingui();
  const { zoomIn, zoomOut } = useControls();

  return (
    <ZoomStyled>
      <IconButton aria-label={t`Zoom in`} onClick={() => zoomIn()}>
        <AddIcon fontSize="small" />
      </IconButton>
      <IconButton aria-label={t`Zoom out`} onClick={() => zoomOut()}>
        <RemoveIcon fontSize="small" />
      </IconButton>
    </ZoomStyled>
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
  border: 1px solid ${({ theme }) => theme.palette.divider};
  background: ${({ theme }) => theme.palette.background.paper};
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

const ZoomStyled = styled('div')`
  position: absolute;
  right: ${({ theme }) => theme.spacing(1.5)};
  bottom: ${({ theme }) => theme.spacing(1.5)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  background: ${({ theme }) => theme.palette.background.paper};
`;
