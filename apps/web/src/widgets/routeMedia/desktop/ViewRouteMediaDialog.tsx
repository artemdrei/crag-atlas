import { Trans, useLingui } from '@lingui/react/macro';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

import { useModal } from '@web/app/providers';

import { RouteMediaGallery } from '../common';

export interface Props {
  open: boolean;
  idRoute: string;
  idMedia?: string;
}

const ViewRouteMediaDialog = ({ open, idRoute, idMedia }: Props) => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const close = () => closeModal('ROUTE_MEDIA_VIEW');

  return (
    <Dialog fullWidth maxWidth="lg" open={open} onClose={close}>
      <DialogTitle>
        <Trans>Video and photo</Trans>
      </DialogTitle>
      <CloseButtonStyled aria-label={t`Close`} onClick={close}>
        <CloseIcon fontSize="small" />
      </CloseButtonStyled>
      <DialogContent>
        <RouteMediaGallery idRoute={idRoute} idMedia={idMedia} />
      </DialogContent>
      <DialogActions>
        <Button type="button" onClick={close}>
          <Trans>Close</Trans>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CloseButtonStyled = styled(IconButton)`
  position: absolute;
  top: ${({ theme }) => theme.spacing(1)};
  right: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.palette.text.secondary};
`;

export default ViewRouteMediaDialog;
