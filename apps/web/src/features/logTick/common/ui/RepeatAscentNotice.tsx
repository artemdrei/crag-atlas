import { Trans, useLingui } from '@lingui/react/macro';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import { formatDate } from '@web/shared/lib';
import { AscentTypeLabel } from '@web/shared/ui';

import type { Tick } from '../entities';

export interface Props {
  firstSend: Tick;
  sendCount: number;
}

export const RepeatAscentNotice = ({ firstSend, sendCount }: Props) => {
  const { i18n } = useLingui();
  const firstDate = formatDate(firstSend.climbedAt, i18n.locale);

  return (
    <Alert severity="success" variant="outlined">
      <AlertTitle>
        <Trans>You have sent this route before</Trans>
      </AlertTitle>
      <Trans>
        First on {firstDate},{' '}
        <AscentTypeLabel ascentType={firstSend.ascentType} />. This one is
        repeat #{sendCount}.
      </Trans>
    </Alert>
  );
};
