import { useLingui } from '@lingui/react/macro';

import { BottomSheet } from '@web/shared/ui';

import { AddRouteMediaForm, useAddRouteMedia } from '../common';

export interface Props {
  open: boolean;
  idRoute: string;
}

const AddRouteMediaSheet = ({ open, idRoute }: Props) => {
  const { t } = useLingui();
  const { isPending, close, createMedia } = useAddRouteMedia(idRoute);

  return (
    <BottomSheet title={t`Add video or photo`} isOpen={open} onClose={close}>
      <AddRouteMediaForm
        isPending={isPending}
        onSubmit={createMedia}
        onCancel={close}
      />
    </BottomSheet>
  );
};

export default AddRouteMediaSheet;
