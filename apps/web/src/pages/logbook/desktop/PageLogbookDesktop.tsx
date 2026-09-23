import { useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useGridColumns } from '@web/shared/lib';
import { ApiFeedback, GridColumnsMenu, PageShell } from '@web/shared/ui';

import type { LogbookTab } from '../common';
import { LogbookTabs, TicksFeed, TicksList, useApiGetTicks } from '../common';

export const PageLogbookDesktop = () => {
  const [tab, setTab] = useState<LogbookTab>('mine');
  const { ticks, isLoading, failure } = useApiGetTicks();
  const { columns, changeColumns } = useGridColumns('crag-atlas:tick-columns');

  return (
    <PageShell spacing={3}>
      <HeaderRowStyled>
        <Typography variant="h4">
          <Trans>My logbook</Trans>
        </Typography>
        <GridColumnsMenu columns={columns} onChange={changeColumns} />
      </HeaderRowStyled>

      <LogbookTabs tab={tab} onChange={setTab} />

      {tab === 'mine' ? (
        <>
          <ApiFeedback
            isLoading={isLoading}
            failure={failure}
            loadingLabel={<Trans>Loading ascents…</Trans>}
          />
          <TicksList ticks={ticks} columns={columns} isLoading={isLoading} />
        </>
      ) : (
        <TicksFeed columns={columns} />
      )}
    </PageShell>
  );
};

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;
