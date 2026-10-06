import { Trans } from '@lingui/react/macro';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useGridColumns } from '@web/shared/lib';
import { ApiFeedback, GridColumnsMenu, PageShell } from '@web/shared/ui';
import { LogbookTabs, TicksList } from '@web/widgets/tickList';

import {
  AscentTypeFilter,
  DisciplineTabs,
  GradeChart,
  LoadMoreOnScroll,
  LogbookFilterFields,
  TicksFeed,
  TicksGroupedList,
  useApiGetTickStats,
  useApiGetTicks,
  useLogbookControls,
  useLogbookView
} from '../common';

export const PageLogbookDesktop = () => {
  const {
    tab,
    discipline,
    sort,
    ascentType,
    view: tickView,
    changeTab,
    changeDiscipline,
    changeSort,
    changeAscentType,
    changeView
  } = useLogbookControls();
  const { ticks, isLoading, isLoadingMore, hasMore, failure, loadMore } =
    useApiGetTicks({ discipline, ascentType, sort });
  const { stats, failure: statsFailure } = useApiGetTickStats();
  const { columns, changeColumns } = useGridColumns('crag-atlas:tick-columns');

  const view = useLogbookView({ ticks, stats, discipline, ascentType });

  return (
    <PageShell spacing={3}>
      <HeaderRowStyled>
        <Typography variant="h4">
          <Trans>Logbook</Trans>
        </Typography>
        {(tab === 'feed' || sort === 'date') && (
          <GridColumnsMenu columns={columns} onChange={changeColumns} />
        )}
      </HeaderRowStyled>

      <LogbookTabs tab={tab} onChange={changeTab} />

      {tab === 'mine' ? (
        <>
          <DisciplineTabs
            discipline={discipline}
            sportCount={stats?.sportCount}
            boulderCount={stats?.boulderCount}
            onChange={changeDiscipline}
          />

          <ApiFeedback failure={failure ?? statsFailure} />

          {view.counts.all > 0 && (
            <ChartCardStyled elevation={0}>
              <AscentTypeFilter
                ascentType={ascentType}
                layout="grid"
                counts={view.counts}
                onChange={changeAscentType}
              />
              <ChartStyled bars={view.bars} />
            </ChartCardStyled>
          )}

          <LogbookFilterFields
            sort={sort}
            ascentType={ascentType}
            view={tickView}
            onSortChange={changeSort}
            onAscentTypeChange={changeAscentType}
            onViewChange={changeView}
          />

          {sort === 'grade' ? (
            <TicksGroupedList
              groups={view.groups}
              ungraded={view.ungraded}
              isCompact={tickView === 'compact'}
              isLoading={isLoading}
            />
          ) : (
            <TicksList
              ticks={ticks}
              columns={columns}
              isCompact={tickView === 'compact'}
              isLoading={isLoading}
            />
          )}

          <LoadMoreOnScroll
            hasMore={hasMore && !failure}
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

const ChartCardStyled = styled(Paper)`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(2.5)};
  background: ${({ theme }) => theme.palette.background.paper};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const ChartStyled = styled(GradeChart)`
  flex: 1 1 auto;
  min-width: 0;
`;
