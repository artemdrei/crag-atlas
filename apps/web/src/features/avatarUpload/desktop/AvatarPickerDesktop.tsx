import { useRef } from 'react';

import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useLingui } from '@lingui/react/macro';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { alpha, styled } from '@mui/material/styles';

import { useModal } from '@web/app/providers';
import { toast } from '@web/shared/lib';
import { UserAvatar } from '@web/shared/ui';

import { isSupportedPhoto, useAvatarActions } from '../common';

export interface Props {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}

export const AvatarPickerDesktop = ({ name, avatarUrl, size = 80 }: Props) => {
  const { t } = useLingui();
  const { openModal } = useModal();
  const { hasPhoto, isPending, remove } = useAvatarActions();
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = (file: File) => {
    if (!isSupportedPhoto(file)) {
      toast.error(t`Only an image can be used as a photo`);

      return;
    }

    openModal('CROP_AVATAR', { file });
  };

  const handleRemove = async () => {
    try {
      await remove();
      toast.success(t`Your photo has been removed`);
    } catch (error) {
      toast.error(resolveFailureMessage(toFailure(error)));
    }
  };

  return (
    <PickerStyled>
      <TriggerStyled
        type="button"
        size={size}
        disabled={isPending}
        aria-label={hasPhoto ? t`Change your photo` : t`Add a photo`}
        onClick={() => inputRef.current?.click()}
      >
        <UserAvatar name={name} avatarUrl={avatarUrl} size={size} />
        {isPending && (
          <span>
            <CircularProgress size={20} color="inherit" />
          </span>
        )}
      </TriggerStyled>

      <ActionsStyled>
        <IconButton
          size="small"
          disabled={isPending}
          aria-label={hasPhoto ? t`Change your photo` : t`Add a photo`}
          onClick={() => inputRef.current?.click()}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
        {hasPhoto && (
          <IconButton
            size="small"
            color="error"
            disabled={isPending}
            aria-label={t`Remove your photo`}
            onClick={handleRemove}
          >
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        )}
      </ActionsStyled>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        aria-label={t`Choose a photo`}
        onChange={(event) => {
          const file = event.target.files?.[0];

          // The same file twice in a row fires no change event.
          event.target.value = '';

          if (file) handlePick(file);
        }}
      />
    </PickerStyled>
  );
};

const PickerStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};

  /* A component selector would need @emotion/babel-plugin. Hidden rather than
     unmounted, so the page does not jump on hover. */
  & > div {
    opacity: 0;
    transition: opacity ${({ theme }) => theme.transitions.duration.shorter}ms;
  }

  &:hover > div,
  &:focus-within > div {
    opacity: 1;
  }
`;

const ActionsStyled = styled('div')`
  display: flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const TriggerStyled = styled('button', {
  shouldForwardProp: (prop) => prop !== 'size'
})<{ size: number }>`
  position: relative;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: none;
  cursor: pointer;

  &:disabled {
    cursor: default;
  }

  /* A component selector would need @emotion/babel-plugin. */
  & > span {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: ${({ theme }) => theme.palette.common.white};
    background: ${({ theme }) => alpha(theme.palette.common.black, 0.5)};
  }
`;
