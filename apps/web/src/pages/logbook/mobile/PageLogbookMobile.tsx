import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { ApiFeedback, PageShell } from '@web/shared/ui';

import {
  AscentTypeFilter,
  BackfillWeatherButton,
  DisciplineTabs,
  GradeChart,
  LoadMoreOnScroll,
  LogbookTabs,
  TicksFeed,
  TicksGroupedList,
  TicksList,
  useApiGetTickStats,
  useApiGetTicks,
  useLogbookControls,
  useLogbookView
} from '../common';
import { LogbookFiltersButton } from './LogbookFiltersButton';

export const PageLogbookMobile = () => {
  const {
    tab,
    discipline,
    sort,
    ascentType,
    changeTab,
    changeDiscipline,
    changeSort,
    changeAscentType
  } = useLogbookControls();
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
          <ToolbarStyled>
            <BackfillWeatherButton />
            <LogbookFiltersButton
              sort={sort}
              ascentType={ascentType}
              onSortChange={changeSort}
              onAscentTypeChange={changeAscentType}
            />
          </ToolbarStyled>
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

          <AscentTypeFilter
            ascentType={ascentType}
            counts={view.counts}
            onChange={changeAscentType}
          />

          {view.bars.length > 0 && <GradeChart bars={view.bars} isCompact />}

          {sort === 'grade' ? (
            <TicksGroupedList
              groups={view.groups}
              ungraded={view.ungraded}
              isLoading={isLoading}
            />
          ) : (
            <TicksList ticks={ticks} isLoading={isLoading} />
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

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const ToolbarStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;
