import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

import { useModal } from '@web/app/providers';

export interface Props {
  open: boolean;
  title: string;
}

const PlaygroundDemoDialog = ({ open, title }: Props) => {
  const { closeModal } = useModal();
  const close = () => closeModal('PLAYGROUND_DEMO');

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={close}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          Registered through ModalProvider, opened by id — the same path every
          real modal takes.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlaygroundDemoDialog;
