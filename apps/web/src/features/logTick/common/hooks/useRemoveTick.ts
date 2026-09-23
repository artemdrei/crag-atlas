import { useLingui } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { toast } from '@web/shared/lib';

import { useApiDeleteTick } from './useApiDeleteTick';

export const useRemoveTick = (idTick: string) => {
  const { t } = useLingui();
  const { closeModal } = useModal();

  const close = () => closeModal('TICK_DELETE');

  const { isPending, deleteTick } = useApiDeleteTick({
    idTick,
    onDeleted: () => {
      toast.success(t`Ascent deleted`);
      close();
    }
  });

  return { isPending, close, deleteTick };
};
