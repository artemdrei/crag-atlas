import { useLingui } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { BottomSheet } from '@web/shared/ui';

import { SaveRegionOfflineBody } from '../common';

export interface Props {
  open: boolean;
  idRegion?: string;
}

const SaveRegionOfflineSheet = ({ open, idRegion }: Props) => {
  const { t } = useLingui();
  const { closeModal } = useModal();

  const dismiss = () => closeModal('SAVE_REGION_OFFLINE');

  return (
    <BottomSheet title={t`Available offline`} isOpen={open} onClose={dismiss}>
      {idRegion && (
        <SaveRegionOfflineBody
          idRegion={idRegion}
          source="header"
          onClose={dismiss}
        />
      )}
    </BottomSheet>
  );
};

export default SaveRegionOfflineSheet;
