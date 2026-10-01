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
  const { isPending, dismiss, save } = useLogTick(idRoute);

  return (
    <BottomSheet isOpen={open} onClose={dismiss}>
      <TickFormHeader
        routeName={routeName}
        routeGrade={routeGrade}
        routeGradeScale={routeGradeScale}
        place={place}
      />
      <TickForm
        idRoute={idRoute}
        routeGrade={routeGrade}
        routeGradeScale={routeGradeScale}
        isPending={isPending}
        onSubmit={save}
        onCancel={dismiss}
      />
    </BottomSheet>
  );
};

export default LogTickSheet;
