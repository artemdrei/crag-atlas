import type { RouteLine } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
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

const TopoPhotoDialog = ({ open, ...photo }: Props) => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const close = () => closeModal('VIEW_TOPO_PHOTO');

  return (
    <Dialog
      fullWidth
      maxWidth="xl"
      open={open}
      // The zoom layer measures itself on mount; a growing box measures wrong.
      transitionDuration={0}
      onClose={close}
    >
      <BodyStyled>
        <TopoPhotoViewer {...photo} />
        <CloseButtonStyled aria-label={t`Close`} onClick={close}>
          <CloseIcon fontSize="small" />
        </CloseButtonStyled>
      </BodyStyled>
    </Dialog>
  );
};

export default TopoPhotoDialog;

const BodyStyled = styled('div')`
  position: relative;
  height: min(88vh, 1100px);
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.palette.background.default};
`;

const CloseButtonStyled = styled(IconButton)`
  position: absolute;
  top: ${({ theme }) => theme.spacing(2)};
  right: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.palette.background.paper};

  &:hover {
    background: ${({ theme }) => theme.palette.action.hover};
  }
`;
