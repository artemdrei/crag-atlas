import { useLingui } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { BottomSheet } from '@web/shared/ui';

import { FeedbackBody } from '../common';

export interface Props {
  open: boolean;
}

const FeedbackSheet = ({ open }: Props) => {
  const { t } = useLingui();
  const { closeModal } = useModal();

  const dismiss = () => closeModal('SEND_FEEDBACK');

  return (
    <BottomSheet title={t`Feedback`} isOpen={open} onClose={dismiss}>
      <FeedbackBody />
    </BottomSheet>
  );
};

export default FeedbackSheet;
