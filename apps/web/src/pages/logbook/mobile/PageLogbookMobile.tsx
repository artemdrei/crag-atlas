import { useState } from 'react';

import { Trans } from '@lingui/react/macro';
import Typography from '@mui/material/Typography';

import { ApiFeedback, PageShell } from '@web/shared/ui';

import type { LogbookTab } from '../common';
import { LogbookTabs, TicksFeed, TicksList, useApiGetTicks } from '../common';

export const PageLogbookMobile = () => {
  const [tab, setTab] = useState<LogbookTab>('mine');
  const { ticks, isLoading, failure } = useApiGetTicks();

  return (
    <PageShell spacing={2} isCompact>
      <Typography variant="h5">
        <Trans>My logbook</Trans>
      </Typography>

      <LogbookTabs tab={tab} onChange={setTab} />

      {tab === 'mine' ? (
        <>
          <ApiFeedback
            isLoading={isLoading}
            failure={failure}
            loadingLabel={<Trans>Loading ascents…</Trans>}
          />
          <TicksList ticks={ticks} isLoading={isLoading} />
        </>
      ) : (
        <TicksFeed />
      )}
    </PageShell>
  );
};
