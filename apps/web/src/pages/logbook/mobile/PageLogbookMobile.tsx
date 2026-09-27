import { useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { ApiFeedback, PageShell } from '@web/shared/ui';

import type { AscentFilter, Discipline, LogbookTab, TickSort } from '../common';
import {
  AscentTypeFilter,
  DisciplineTabs,
  GradeChart,
  LoadMoreOnScroll,
  LogbookTabs,
  TicksFeed,
  TicksGroupedList,
  TicksList,
  useApiGetTickStats,
  useApiGetTicks,
  useLogbookView
} from '../common';
import { LogbookFiltersButton } from './LogbookFiltersButton';

export const PageLogbookMobile = () => {
  const [tab, setTab] = useState<LogbookTab>('mine');
  const [discipline, setDiscipline] = useState<Discipline>('sport');
  const [sort, setSort] = useState<TickSort>('grade');
  const [ascentType, setAscentType] = useState<AscentFilter>('all');
  const { ticks, isLoading, isLoadingMore, hasMore, failure, loadMore } =
    useApiGetTicks({ discipline, ascentType, sort });
  const { stats, failure: statsFailure } = useApiGetTickStats();

  const view = useLogbookView({ ticks, stats, discipline, ascentType });

  return (
    <PageShell spacing={2} isCompact>
      <HeaderRowStyled>
        <Typography variant="h5">
          <Trans>My logbook</Trans>
        </Typography>
        {tab === 'mine' && (
          <LogbookFiltersButton
            sort={sort}
            ascentType={ascentType}
            onSortChange={setSort}
            onAscentTypeChange={setAscentType}
          />
        )}
      </HeaderRowStyled>

      <LogbookTabs tab={tab} onChange={setTab} />

      {tab === 'mine' ? (
        <>
          <DisciplineTabs
            discipline={discipline}
            sportCount={stats?.sportCount}
            boulderCount={stats?.boulderCount}
            onChange={setDiscipline}
          />

          <ApiFeedback
            isLoading={isLoading}
            failure={failure ?? statsFailure}
            loadingLabel={<Trans>Loading ascents…</Trans>}
          />

          <AscentTypeFilter
            ascentType={ascentType}
            counts={view.counts}
            onChange={setAscentType}
          />

          {view.bars.length > 0 && <GradeChart bars={view.bars} isCompact />}

          {sort === 'grade' ? (
            <TicksGroupedList groups={view.groups} ungraded={view.ungraded} />
          ) : (
            <TicksList ticks={ticks} isLoading={isLoading} />
          )}

          <LoadMoreOnScroll
            hasMore={hasMore}
            isLoading={isLoadingMore}
            onReach={loadMore}
          />
        </>
      ) : (
        <TicksFeed />
      )}
    </PageShell>
  );
};

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;
