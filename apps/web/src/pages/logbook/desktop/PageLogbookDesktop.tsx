import { Trans } from '@lingui/react/macro';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useGridColumns } from '@web/shared/lib';
import { ApiFeedback, GridColumnsMenu, PageShell } from '@web/shared/ui';

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

export const PageLogbookDesktop = () => {
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
            <BackfillWeatherButton />
            {sort === 'date' && (
              <GridColumnsMenu columns={columns} onChange={changeColumns} />
            )}
            <LogbookFiltersButton
              sort={sort}
              ascentType={ascentType}
              onSortChange={changeSort}
              onAscentTypeChange={changeAscentType}
            />
          </ToolbarStyled>
        ) : (
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

          {sort === 'grade' ? (
            <TicksGroupedList
              groups={view.groups}
              ungraded={view.ungraded}
              isLoading={isLoading}
            />
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
