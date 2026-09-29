import type { ReactNode } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';

import { useLingui } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import { alpha, styled } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import type { CropPoint, SourceRect } from '@web/shared/lib';
import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from '@web/shared/lib';

const FREE = 'free';

const PRESETS = [
  { id: FREE, ratio: undefined },
  { id: '1:1', ratio: 1 },
  { id: '3:2', ratio: 3 / 2 },
  { id: '2:3', ratio: 2 / 3 },
  { id: '4:3', ratio: 4 / 3 },
  { id: '16:9', ratio: 16 / 9 }
];

const ZOOM_NUDGE = 0.2;

const clamp = (zoom: number): number =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(zoom.toFixed(2))));

export interface Props {
  src: string;
  aspect?: number;
  position: CropPoint;
  zoom: number;
  isRound?: boolean;
  onPositionChange: (position: CropPoint) => void;
  onZoomChange: (zoom: number) => void;
  onCropChange: (crop: SourceRect) => void;
  onAspectChange?: (aspect?: number) => void;
  action?: ReactNode;
}

export const ImageCropper = ({
  src,
  aspect,
  position,
  zoom,
  isRound,
  onPositionChange,
  onZoomChange,
  onCropChange,
  onAspectChange,
  action
}: Props) => {
  const { t } = useLingui();
  const active = PRESETS.find(({ ratio }) => ratio === aspect)?.id ?? FREE;

  return (
    <StageStyled>
      <Cropper
        image={src}
        crop={position}
        zoom={zoom}
        aspect={aspect}
        cropShape={isRound ? 'round' : 'rect'}
        showGrid={!isRound}
        onCropChange={onPositionChange}
        onZoomChange={onZoomChange}
        onCropComplete={(_area, areaPixels) => onCropChange(areaPixels)}
      />
      {/* On the photo rather than in the toolbar: both settings are about what
          is being looked at, and they are of no use apart from each other. */}
      <PanelStyled>
        {onAspectChange && (
          <>
            <PresetsStyled
              exclusive
              size="small"
              value={active}
              aria-label={t`Crop shape`}
              onChange={(_event, next: string | null) =>
                next &&
                onAspectChange(PRESETS.find(({ id }) => id === next)?.ratio)
              }
            >
              {PRESETS.map(({ id }) => (
                <ToggleButton key={id} value={id}>
                  {id === FREE ? t`Free` : id}
                </ToggleButton>
              ))}
            </PresetsStyled>
            <DividerStyled orientation="vertical" flexItem />
          </>
        )}
        <IconButton
          size="small"
          color="inherit"
          disabled={zoom <= MIN_ZOOM}
          aria-label={t`Zoom out`}
          onClick={() => onZoomChange(clamp(zoom - ZOOM_NUDGE))}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>
        <ZoomStyled
          size="small"
          value={zoom}
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={ZOOM_STEP}
          aria-label={t`Zoom`}
          onChange={(_event, value) => onZoomChange(value as number)}
        />
        <IconButton
          size="small"
          color="inherit"
          disabled={zoom >= MAX_ZOOM}
          aria-label={t`Zoom in`}
          onClick={() => onZoomChange(clamp(zoom + ZOOM_NUDGE))}
        >
          <AddIcon fontSize="small" />
        </IconButton>
        {action && (
          <>
            <DividerStyled orientation="vertical" flexItem />
            {action}
          </>
        )}
      </PanelStyled>
    </StageStyled>
  );
};

// react-easy-crop fills whatever it is given, so the caller sizes the frame:
// a percentage height resolves to nothing inside an aspect-ratio box.
const StageStyled = styled('div')`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.palette.common.black};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  overflow: hidden;
`;

const PanelStyled = styled('div')`
  position: absolute;
  right: ${({ theme }) => theme.spacing(1.5)};
  bottom: ${({ theme }) => theme.spacing(1.5)};
  z-index: 1;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  max-width: calc(100% - ${({ theme }) => theme.spacing(3)});
  padding: ${({ theme }) => theme.spacing(0.5, 1)};
  border-radius: 999px;
  color: ${({ theme }) => theme.palette.common.white};
  background: ${({ theme }) => alpha(theme.palette.common.black, 0.65)};
  backdrop-filter: blur(6px);
`;

const PresetsStyled = styled(ToggleButtonGroup)`
  .MuiToggleButton-root {
    padding: ${({ theme }) => theme.spacing(0.25, 1)};
    color: ${({ theme }) => alpha(theme.palette.common.white, 0.7)};
    border-color: transparent;

    &.Mui-selected {
      color: ${({ theme }) => theme.palette.common.white};
      background: ${({ theme }) => alpha(theme.palette.common.white, 0.2)};
    }
  }
`;

const DividerStyled = styled(Divider)`
  margin: ${({ theme }) => theme.spacing(0.5, 0.5)};
  border-color: ${({ theme }) => alpha(theme.palette.common.white, 0.3)};
`;

const ZoomStyled = styled(Slider)`
  width: 96px;
  flex: 0 0 auto;
  color: ${({ theme }) => theme.palette.common.white};
`;
