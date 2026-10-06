import { useLingui } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { BottomSheet } from '@web/shared/ui';

import { InstallHintBody } from './InstallHintBody';

export interface Props {
  open: boolean;
}

const InstallHintSheet = ({ open }: Props) => {
  const { t } = useLingui();
  const { closeModal } = useModal();

  const dismiss = () => closeModal('INSTALL_HINT');

  return (
    <BottomSheet title={t`Install crag-atlas`} isOpen={open} onClose={dismiss}>
      <InstallHintBody onClose={dismiss} />
    </BottomSheet>
  );
};

export default InstallHintSheet;
