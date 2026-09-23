import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import type { TickHeader } from '../common';
import { TickForm, TickFormHeader, useLogTick } from '../common';

export interface Props extends TickHeader {
  open: boolean;
  idRoute: string;
}

const LogTickDialog = ({
  open,
  idRoute,
  routeName,
  routeGrade,
  routeGradeScale,
  place
}: Props) => {
  const { isPending, close, save } = useLogTick(idRoute);

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={close}>
      <DialogTitle>
        <TickFormHeader
          routeName={routeName}
          routeGrade={routeGrade}
          routeGradeScale={routeGradeScale}
          place={place}
        />
      </DialogTitle>
      <DialogContent>
        <TickForm
          routeGrade={routeGrade}
          routeGradeScale={routeGradeScale}
          isPending={isPending}
          onSubmit={save}
          onCancel={close}
        />
      </DialogContent>
    </Dialog>
  );
};

export default LogTickDialog;
