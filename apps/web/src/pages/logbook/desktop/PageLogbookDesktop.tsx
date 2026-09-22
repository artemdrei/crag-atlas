import { Trans } from '@lingui/react/macro';
import Typography from '@mui/material/Typography';

import { ApiFeedback, PageShell } from '@web/shared/ui';

import { TicksList, useApiGetTicks } from '../common';

export const PageLogbookDesktop = () => {
  const { ticks, isLoading, failure } = useApiGetTicks();

  return (
    <PageShell spacing={3}>
      <Typography variant="h4">
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
