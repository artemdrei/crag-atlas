import { useControls, useTransformComponent } from 'react-zoom-pan-pinch';

import { useLingui } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const TopoZoomControls = () => {
  const { t } = useLingui();
  const { zoomIn, zoomOut, resetTransform } = useControls();
  const scale = useTransformComponent(({ state }) => state.scale);

  return (
    <ControlsStyled>
      <IconButton
        size="small"
        aria-label={t`Zoom out`}
        onClick={() => zoomOut()}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <ScaleStyled
        type="button"
        aria-label={t`Fit the photo`}
        onClick={() => resetTransform()}
      >
        <Typography variant="caption">{Math.round(scale * 100)}%</Typography>
      </ScaleStyled>
      <IconButton size="small" aria-label={t`Zoom in`} onClick={() => zoomIn()}>
        <AddIcon fontSize="small" />
      </IconButton>
    </ControlsStyled>
  );
};

const ControlsStyled = styled('div')`
  position: absolute;
  right: ${({ theme }) => theme.spacing(1.5)};
  bottom: ${({ theme }) => theme.spacing(1.5)};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => theme.spacing(0.25)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  background: ${({ theme }) => theme.palette.background.paper};
  opacity: 0.6;
  transition: opacity 0.15s ease-out;

  &:hover {
    opacity: 1;
  }
`;

const ScaleStyled = styled('button')`
  min-width: 48px;
  padding: 0;
  cursor: pointer;
  border: none;
  background: none;
  color: ${({ theme }) => theme.palette.text.secondary};
`;
