import { styled } from '@mui/material/styles';

import type { TopoPhotoPayload } from '../entities';
import { TopoZoomControls } from './TopoZoomControls';
import { TopoZoomStage } from './TopoZoomStage';

export interface Props extends TopoPhotoPayload {
  className?: string;
}

export const TopoPhotoViewer = ({
  photoUrl,
  label,
  lines,
  numberOf,
  tickedRoutes,
  colorOf,
  className
}: Props) => (
  <StageStyled
    className={className}
    photoUrl={photoUrl}
    label={label}
    lines={lines}
    numberOf={numberOf}
    tickedRoutes={tickedRoutes}
    colorOf={colorOf}
  >
    <TopoZoomControls list="topo_photo" />
  </StageStyled>
);

const StageStyled = styled(TopoZoomStage)`
  height: 100%;
`;
