import { useLingui } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { toast } from '@web/shared/lib';
import { BottomSheet } from '@web/shared/ui';

import { TickForm, useApiCreateTick } from '../common';

export interface Props {
  open: boolean;
  idRoute: string;
}

const LogTickSheet = ({ open, idRoute }: Props) => {
  const { t } = useLingui();
  const { closeModal } = useModal();

  const close = () => closeModal('LOG_TICK');

  const { isPending, createTick } = useApiCreateTick({
    onCreated: () => {
      toast.success(t`Ascent logged`);
      close();
    }
  });

  return (
    <BottomSheet title={t`Log ascent`} isOpen={open} onClose={close}>
      <TickForm
        isPending={isPending}
        onSubmit={(payload) => createTick({ ...payload, idRoute })}
        onCancel={close}
      />
    </BottomSheet>
  );
};

export default LogTickSheet;
