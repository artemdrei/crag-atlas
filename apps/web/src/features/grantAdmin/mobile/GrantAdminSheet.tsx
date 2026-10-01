import { useLingui } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { BottomSheet } from '@web/shared/ui';

import { GrantAdminBody } from '../common';

export interface Props {
  open: boolean;
}

const GrantAdminSheet = ({ open }: Props) => {
  const { t } = useLingui();
  const { closeModal } = useModal();

  const dismiss = () => closeModal('GRANT_ADMIN');

  return (
    <BottomSheet title={t`Add admin`} isOpen={open} onClose={dismiss}>
      <GrantAdminBody onClose={dismiss} />
    </BottomSheet>
  );
};

export default GrantAdminSheet;
