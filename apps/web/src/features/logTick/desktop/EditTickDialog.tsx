import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import type { Tick } from '../common';
import { TickForm, TickFormHeader, useEditTick } from '../common';

export interface Props {
  open: boolean;
  tick: Tick;
}

const EditTickDialog = ({ open, tick }: Props) => {
  const { isPending, close, save } = useEditTick(tick);

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={close}>
      <DialogTitle>
        <TickFormHeader
          routeName={tick.routeName}
          routeGrade={tick.routeGrade}
          routeGradeScale={tick.routeGradeScale}
          place={tick.sectorName}
        />
      </DialogTitle>
      <DialogContent>
        <TickForm
          tick={tick}
          isPending={isPending}
          onSubmit={save}
          onCancel={close}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditTickDialog;
