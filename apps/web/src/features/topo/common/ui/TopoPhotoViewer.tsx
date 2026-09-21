import type { RouteLine } from '@crag-atlas/api';
import { styled } from '@mui/material/styles';

import { TopoZoomControls } from './TopoZoomControls';
import { TopoZoomStage } from './TopoZoomStage';

export interface Props {
  photoUrl: string;
  label: string;
  lines: RouteLine[];
  numberOf?: Record<string, number>;
  colorOf?: (idRoute: string) => string | undefined;
  className?: string;
}

export const TopoPhotoViewer = ({
  photoUrl,
  label,
  lines,
  numberOf,
  colorOf,
  className
}: Props) => (
  <StageStyled
    className={className}
    photoUrl={photoUrl}
    label={label}
    lines={lines}
    numberOf={numberOf}
    colorOf={colorOf}
  >
    <TopoZoomControls />
  </StageStyled>
);

const StageStyled = styled(TopoZoomStage)`
  width: 100%;
  height: 100%;
`;
