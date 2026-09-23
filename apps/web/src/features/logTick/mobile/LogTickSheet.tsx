import { BottomSheet } from '@web/shared/ui';

import type { TickHeader } from '../common';
import { TickForm, TickFormHeader, useLogTick } from '../common';

export interface Props extends TickHeader {
  open: boolean;
  idRoute: string;
}

const LogTickSheet = ({
  open,
  idRoute,
  routeName,
  routeGrade,
  routeGradeScale,
  place
}: Props) => {
  const { isPending, close, save } = useLogTick(idRoute);

  return (
    <BottomSheet isOpen={open} onClose={close}>
      <TickFormHeader
        routeName={routeName}
        routeGrade={routeGrade}
        routeGradeScale={routeGradeScale}
        place={place}
      />
      <TickForm
        routeGrade={routeGrade}
        routeGradeScale={routeGradeScale}
        isPending={isPending}
        onSubmit={save}
        onCancel={close}
      />
    </BottomSheet>
  );
};

export default LogTickSheet;
