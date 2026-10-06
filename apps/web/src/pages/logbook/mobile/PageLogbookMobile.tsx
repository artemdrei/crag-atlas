import { Trans } from '@lingui/react/macro';
import Typography from '@mui/material/Typography';

import { ApiFeedback, PageShell } from '@web/shared/ui';
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

export const PageLogbookMobile = () => {
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

  const view = useLogbookView({ ticks, stats, discipline, ascentType });

  return (
    <PageShell spacing={2} isCompact>
      <Typography variant="h5">
        <Trans>Logbook</Trans>
      </Typography>

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

          <AscentTypeFilter
            ascentType={ascentType}
            counts={view.counts}
            onChange={changeAscentType}
          />

          {view.bars.length > 0 && <GradeChart bars={view.bars} isCompact />}

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
        <TicksFeed />
      )}
    </PageShell>
  );
};
