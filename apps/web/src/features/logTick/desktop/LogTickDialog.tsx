import type { TickHeader } from '../common';
import { TickForm, useLogTick } from '../common';
import { TickFormDialog } from './TickFormDialog';

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
  const { isPending, dismiss, save } = useLogTick(idRoute);

  return (
    <TickFormDialog
      routeName={routeName}
      routeGrade={routeGrade}
      routeGradeScale={routeGradeScale}
      place={place}
      open={open}
      onClose={dismiss}
    >
      <TickForm
        idRoute={idRoute}
        routeGrade={routeGrade}
        routeGradeScale={routeGradeScale}
        isPending={isPending}
        onSubmit={save}
        onCancel={dismiss}
      />
    </TickFormDialog>
  );
};

export default LogTickDialog;
