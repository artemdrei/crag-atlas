import type { Coords } from '@web/shared/types';

import type { TickHeader } from '../common';
import { TickForm, useLogTick } from '../common';
import { TickFormDialog } from './TickFormDialog';

export interface Props extends TickHeader {
  open: boolean;
  idRoute: string;
  coords?: Coords;
}

const LogTickDialog = ({
  open,
  idRoute,
  coords,
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
        coords={coords}
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
