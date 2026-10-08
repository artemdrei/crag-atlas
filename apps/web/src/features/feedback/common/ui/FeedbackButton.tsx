import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';

import { useModal } from '@web/app/providers';

export const FeedbackButton = () => {
  const { openModal } = useModal();

  return (
    <Button color="inherit" onClick={() => openModal('SEND_FEEDBACK')}>
      <Trans>Send feedback</Trans>
    </Button>
  );
};
