import { Trans } from '@lingui/react/macro';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { alpha, styled } from '@mui/material/styles';

import { useModal } from '@web/app/providers';

import type { TopoPhotoPayload } from '../common';
import { TopoZoomStage } from '../common';

export interface Props extends TopoPhotoPayload {
  open: boolean;
}

const TopoPhotoModal = ({ open, ...photo }: Props) => {
  const { closeModal } = useModal();
  const close = () => closeModal('VIEW_TOPO_PHOTO');

  return (
    <DialogStyled
      fullScreen
      open={open}
      // The zoom layer measures itself on mount; a growing box measures wrong.
      transitionDuration={0}
      onClose={close}
    >
      <StageStyled {...photo} />
      <CloseButtonStyled
        variant="contained"
        startIcon={<CloseIcon />}
        onClick={close}
      >
        <Trans>Close</Trans>
      </CloseButtonStyled>
    </DialogStyled>
  );
};

export default TopoPhotoModal;

const DialogStyled = styled(Dialog)`
  & .MuiDialog-paper {
    background: ${({ theme }) => theme.palette.common.black};
  }
`;

const StageStyled = styled(TopoZoomStage)`
  height: 100%;
  padding: 0;
  border-radius: 0;
`;

const CloseButtonStyled = styled(Button)`
  position: absolute;
  bottom: calc(
    env(safe-area-inset-bottom) + ${({ theme }) => theme.spacing(3)}
  );
  left: 50%;
  transform: translateX(-50%);
  padding: ${({ theme }) => theme.spacing(1, 3)};
  border-radius: 999px;
  color: ${({ theme }) => theme.palette.common.white};
  background: ${({ theme }) => alpha(theme.palette.common.black, 0.6)};
  box-shadow: none;

  &:hover {
    background: ${({ theme }) => alpha(theme.palette.common.black, 0.8)};
    box-shadow: none;
  }
`;
