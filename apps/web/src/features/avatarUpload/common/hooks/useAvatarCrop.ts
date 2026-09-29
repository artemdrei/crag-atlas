import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useLingui } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { toast, useImageCrop, useObjectUrl } from '@web/shared/lib';

import { useApiReplaceAvatar } from './useApiReplaceAvatar';

export const useAvatarCrop = (file: File) => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const { isPending, replaceAvatar } = useApiReplaceAvatar();
  const { position, zoom, crop, setPosition, setZoom, setCrop } =
    useImageCrop();
  const source = useObjectUrl(file);

  const close = () => closeModal('CROP_AVATAR');

  const save = async () => {
    if (!crop) return;

    try {
      await replaceAvatar({ file, crop });
      toast.success(t`Your photo has been updated`);
      close();
    } catch (error) {
      toast.error(resolveFailureMessage(toFailure(error)));
    }
  };

  return {
    close,
    isPending,
    isCropped: Boolean(crop),
    cropper: {
      src: source,
      aspect: 1,
      isRound: true,
      position,
      zoom,
      onPositionChange: setPosition,
      onZoomChange: setZoom,
      onCropChange: setCrop
    },
    save
  };
};
