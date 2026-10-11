import { Trans } from '@lingui/react/macro';
import Typography from '@mui/material/Typography';

import { ApiFeedback, LoadMoreOnScroll } from '@web/shared/ui';
import { TicksList, TicksSkeleton } from '@web/widgets/tickList';

import { useApiGetTicksFeed } from '../hooks';

export interface Props {
  columns?: number;
}

export const TicksFeed = ({ columns }: Props) => {
  const { ticks, isLoading, isLoadingMore, hasMore, failure, loadMore } =
    useApiGetTicksFeed();

  return (
    <>
      <ApiFeedback failure={failure} />
      {!isLoading && ticks.length === 0 ? (
        <Typography color="text.secondary">
          <Trans>Nobody has logged an ascent yet.</Trans>
        </Typography>
      ) : (
        <TicksList
          ticks={ticks}
          columns={columns}
          isCommunity
          isLoading={isLoading}
        />
      )}
      <LoadMoreOnScroll
        hasMore={hasMore && !failure}
        isLoading={isLoadingMore}
        onReach={loadMore}
      >
        <TicksSkeleton count={1} />
      </LoadMoreOnScroll>
    </>
  );
};
