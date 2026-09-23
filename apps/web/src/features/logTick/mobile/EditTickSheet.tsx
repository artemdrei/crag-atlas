import { BottomSheet } from '@web/shared/ui';

import type { Tick } from '../common';
import { TickForm, TickFormHeader, useEditTick } from '../common';

export interface Props {
  open: boolean;
  tick: Tick;
}

const EditTickSheet = ({ open, tick }: Props) => {
  const { isPending, close, save } = useEditTick(tick);

  return (
    <BottomSheet isOpen={open} onClose={close}>
      <TickFormHeader
        routeName={tick.routeName}
        routeGrade={tick.routeGrade}
        routeGradeScale={tick.routeGradeScale}
        place={tick.sectorName}
      />
      <TickForm
        tick={tick}
        isPending={isPending}
        onSubmit={save}
        onCancel={close}
      />
    </BottomSheet>
  );
};

export default EditTickSheet;
