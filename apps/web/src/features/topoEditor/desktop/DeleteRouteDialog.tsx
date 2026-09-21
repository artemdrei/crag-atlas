import { Trans } from '@lingui/react/macro';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { styled } from '@mui/material/styles';

import { useModal } from '@web/app/providers';

export interface Props {
  routeName: string;
  isNew: boolean;
  open: boolean;
  onConfirm: () => void;
}

const DeleteRouteDialog = ({ routeName, isNew, open, onConfirm }: Props) => {
  const { closeModal } = useModal();

  const close = () => closeModal('DELETE_ROUTE');

  const confirm = () => {
    onConfirm();
    close();
  };

  return (
    <Dialog open={open} onClose={close}>
      <DialogTitle>
        <Trans>Delete the route?</Trans>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {isNew ? (
            <Trans>
              {routeName} was never saved, so it just disappears from this
              panel.
            </Trans>
          ) : (
            <Trans>
              {routeName} disappears from the catalog together with its lines on
              every photo, for everyone, straight away. This cannot be undone.
            </Trans>
          )}
        </DialogContentText>
        {!isNew && (
          <AlertStyled severity="info">
            <Trans>
              A route with logged ascents cannot be deleted: those ascents stay
              in people's logbooks.
            </Trans>
          </AlertStyled>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>
          <Trans>Cancel</Trans>
        </Button>
        <Button color="error" variant="contained" onClick={confirm}>
          <Trans>Delete route</Trans>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteRouteDialog;

const AlertStyled = styled(Alert)`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;
