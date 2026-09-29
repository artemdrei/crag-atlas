import { styled } from '@mui/material/styles';

import { ImageCropper } from '@web/shared/ui';

import type { useAvatarCrop } from '../hooks';

export interface Props {
  cropper: ReturnType<typeof useAvatarCrop>['cropper'];
}

export const AvatarCropStage = ({ cropper }: Props) => (
  <StageStyled>{cropper.src && <ImageCropper {...cropper} />}</StageStyled>
);

const StageStyled = styled('div')`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
`;
