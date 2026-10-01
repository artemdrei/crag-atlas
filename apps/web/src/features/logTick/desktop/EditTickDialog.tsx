import type { Tick } from '../common';
import { TickForm, useEditTick } from '../common';
import { TickFormDialog } from './TickFormDialog';

export interface Props {
  open: boolean;
  tick: Tick;
}

const EditTickDialog = ({ open, tick }: Props) => {
  const { isPending, close, save } = useEditTick(tick);

  return (
    <TickFormDialog
      routeName={tick.routeName}
      routeGrade={tick.routeGrade}
      routeGradeScale={tick.routeGradeScale}
      place={tick.sectorName}
      open={open}
      onClose={close}
    >
      <TickForm
        tick={tick}
        idRoute={tick.idRoute}
        isPending={isPending}
        onSubmit={save}
        onCancel={close}
      />
    </TickFormDialog>
  );
};

export default EditTickDialog;
