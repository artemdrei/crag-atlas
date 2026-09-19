import { Trans, useLingui } from '@lingui/react/macro';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { useModal } from '@web/app/providers';
import { toast } from '@web/shared/lib';

import { TickForm, useApiCreateTick } from '../common';

export interface Props {
  open: boolean;
  idRoute: string;
}

const LogTickDialog = ({ open, idRoute }: Props) => {
  const { t } = useLingui();
  const { closeModal } = useModal();

  const close = () => closeModal('LOG_TICK');

  const { isPending, createTick } = useApiCreateTick({
    onCreated: () => {
      toast.success(t`Ascent logged`);
      close();
    }
  });

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={close}>
      <DialogTitle>
        <Trans>Log ascent</Trans>
      </DialogTitle>
      <DialogContent>
        <TickForm
          isPending={isPending}
          onSubmit={(payload) => createTick({ ...payload, idRoute })}
          onCancel={close}
        />
      </DialogContent>
    </Dialog>
  );
};

export default LogTickDialog;
