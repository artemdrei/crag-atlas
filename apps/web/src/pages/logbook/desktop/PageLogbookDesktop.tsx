import { useState } from 'react';

import { Trans } from '@lingui/react/macro';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useGridColumns } from '@web/shared/lib';
import { ApiFeedback, GridColumnsMenu, PageShell } from '@web/shared/ui';

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

export const PageLogbookDesktop = () => {
  const [tab, setTab] = useState<LogbookTab>('mine');
  const [discipline, setDiscipline] = useState<Discipline>('sport');
  const [sort, setSort] = useState<TickSort>('grade');
  const [ascentType, setAscentType] = useState<AscentFilter>('all');
  const { ticks, isLoading, isLoadingMore, hasMore, failure, loadMore } =
    useApiGetTicks({ discipline, ascentType, sort });
  const { stats, failure: statsFailure } = useApiGetTickStats();
  const { columns, changeColumns } = useGridColumns('crag-atlas:tick-columns');

  const view = useLogbookView({ ticks, stats, discipline, ascentType });

  return (
    <PageShell spacing={3}>
      <HeaderRowStyled>
        <Typography variant="h4">
          <Trans>My logbook</Trans>
        </Typography>
        {tab === 'mine' ? (
          <ToolbarStyled>
            {sort === 'date' && (
              <GridColumnsMenu columns={columns} onChange={changeColumns} />
            )}
            <LogbookFiltersButton
              sort={sort}
              ascentType={ascentType}
              onSortChange={setSort}
              onAscentTypeChange={setAscentType}
            />
          </ToolbarStyled>
        ) : (
          <GridColumnsMenu columns={columns} onChange={changeColumns} />
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

          {view.bars.length > 0 && (
            <ChartCardStyled elevation={0}>
              <GradeChart bars={view.bars} />
            </ChartCardStyled>
          )}

          {sort === 'grade' ? (
            <TicksGroupedList groups={view.groups} ungraded={view.ungraded} />
          ) : (
            <TicksList ticks={ticks} columns={columns} isLoading={isLoading} />
          )}

          <LoadMoreOnScroll
            hasMore={hasMore}
            isLoading={isLoadingMore}
            onReach={loadMore}
          />
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

const ToolbarStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const ChartCardStyled = styled(Paper)`
  padding: ${({ theme }) => theme.spacing(2.5)};
  background: ${({ theme }) => theme.palette.background.paper};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;
