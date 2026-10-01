import { Trans } from '@lingui/react/macro';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import Button from '@mui/material/Button';

import { useApiBackfillWeather } from '../hooks';

export const BackfillWeatherButton = () => {
  const { isPending, backfill } = useApiBackfillWeather();

  return (
    <Button
      size="small"
      startIcon={<CloudSyncIcon />}
      disabled={isPending}
      onClick={() => backfill()}
    >
      {isPending ? <Trans>Adding…</Trans> : <Trans>Add conditions</Trans>}
    </Button>
  );
};
