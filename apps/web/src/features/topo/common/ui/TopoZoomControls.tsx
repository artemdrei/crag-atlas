import { useControls, useTransformComponent } from 'react-zoom-pan-pinch';

import { useLingui } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import RemoveIcon from '@mui/icons-material/Remove';
import IconButton from '@mui/material/IconButton';
import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { trackListControl } from '@web/shared/lib';

export interface Props {
  list?: 'sector' | 'topo_photo';
  onExpand?: () => void;
}

export const TopoZoomControls = ({ list, onExpand }: Props) => {
  const { t } = useLingui();
  const controls = useControls();

  const zoom = (value: 'in' | 'out' | 'reset') => {
    if (list) trackListControl(list, 'zoom', value);

    if (value === 'in') controls.zoomIn();
    else if (value === 'out') controls.zoomOut();
    else controls.resetTransform();
  };
  const scale = useTransformComponent(({ state }) => state.scale);

  return (
    <ControlsStyled>
      <IconButton
        size="small"
        aria-label={t`Zoom out`}
        onClick={() => zoom('out')}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
      <ScaleStyled
        type="button"
        aria-label={t`Fit the photo`}
        onClick={() => zoom('reset')}
      >
        <Typography variant="caption">{Math.round(scale * 100)}%</Typography>
      </ScaleStyled>
      <IconButton
        size="small"
        aria-label={t`Zoom in`}
        onClick={() => zoom('in')}
      >
        <AddIcon fontSize="small" />
      </IconButton>
      {onExpand && (
        <IconButton
          size="small"
          aria-label={t`Open the photo`}
          onClick={onExpand}
        >
          <OpenInFullIcon fontSize="small" />
        </IconButton>
      )}
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
  background: ${({ theme }) => alpha(theme.palette.background.paper, 0.6)};
  opacity: 0.45;
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
