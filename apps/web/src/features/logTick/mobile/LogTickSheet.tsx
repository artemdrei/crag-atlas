import type { Coords } from '@web/shared/types';
import { BottomSheet } from '@web/shared/ui';

import type { TickHeader } from '../common';
import { TickForm, TickFormHeader, useLogTick } from '../common';

export interface Props extends TickHeader {
  open: boolean;
  idRoute: string;
  coords?: Coords;
}

const LogTickSheet = ({
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
    <BottomSheet isOpen={open} onClose={dismiss}>
      <TickFormHeader
        routeName={routeName}
        routeGrade={routeGrade}
        routeGradeScale={routeGradeScale}
        place={place}
      />
      <TickForm
        idRoute={idRoute}
        coords={coords}
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
