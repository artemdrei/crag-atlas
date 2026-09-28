import type { RouteLine } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

import { useModal } from '@web/app/providers';

import { TopoPhotoViewer } from '../common';

export interface Props {
  open: boolean;
  photoUrl: string;
  label: string;
  lines: RouteLine[];
  numberOf?: Record<string, number>;
  colorOf?: (idRoute: string) => string | undefined;
}

const TopoPhotoModal = ({ open, ...photo }: Props) => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const close = () => closeModal('VIEW_TOPO_PHOTO');

  return (
    <DialogStyled
      fullWidth
      maxWidth="sm"
      open={open}
      // The zoom layer measures itself on mount; a growing box measures wrong.
      transitionDuration={0}
      onClose={close}
    >
      <CloseButtonStyled aria-label={t`Close`} onClick={close}>
        <CloseIcon fontSize="small" />
      </CloseButtonStyled>
      <ContentStyled>
        <TopoPhotoViewer {...photo} />
      </ContentStyled>
      <DialogActions>
        <Button type="button" onClick={close}>
          <Trans>Close</Trans>
        </Button>
      </DialogActions>
    </DialogStyled>
  );
};

export default TopoPhotoModal;

const DialogStyled = styled(Dialog)`
  & .MuiDialog-paper {
    height: 70svh;
  }
`;

// What is left of the dialog once its own chrome is taken out: the photo fits
// inside this, whole, rather than being cropped or stretched to it.
const ContentStyled = styled(DialogContent)`
  --topo-stage-height: 56svh;
  display: flex;
  padding: ${({ theme }) => theme.spacing(1)};
`;

// It sits on the photo, which is any colour at all, so it brings its own
// surface rather than trusting what is behind it.
const CloseButtonStyled = styled(IconButton)`
  position: absolute;
  top: ${({ theme }) => theme.spacing(1)};
  right: ${({ theme }) => theme.spacing(1)};
  z-index: 1;
  color: ${({ theme }) => theme.palette.text.primary};
  background: ${({ theme }) => theme.palette.background.paper};
  box-shadow: ${({ theme }) => theme.shadows[2]};

  &:hover {
    background: ${({ theme }) => theme.palette.action.hover};
  }
`;
