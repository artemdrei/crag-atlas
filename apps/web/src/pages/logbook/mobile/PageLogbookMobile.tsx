import { Trans } from '@lingui/react/macro';
import Typography from '@mui/material/Typography';

import { ApiFeedback, PageShell } from '@web/shared/ui';

import { TicksList, useApiGetTicks } from '../common';

export const PageLogbookMobile = () => {
  const { ticks, isLoading, failure } = useApiGetTicks();

  return (
    <PageShell spacing={2} isCompact>
      <Typography variant="h5">
        <Trans>My logbook</Trans>
      </Typography>
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading ascents…</Trans>}
      />
      <TicksList ticks={ticks} isLoading={isLoading} />
    </PageShell>
  );
};
