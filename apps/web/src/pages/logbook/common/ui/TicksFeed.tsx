import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { ApiFeedback } from '@web/shared/ui';

import { useApiGetTicksFeed } from '../hooks';
import { TicksList } from './TicksList';

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
      {hasMore && (
        <MoreRowStyled>
          <Button
            variant="outlined"
            disabled={isLoadingMore}
            onClick={() => loadMore()}
          >
            {isLoadingMore ? <Trans>Loading…</Trans> : <Trans>Show more</Trans>}
          </Button>
        </MoreRowStyled>
      )}
    </>
  );
};

const MoreRowStyled = styled('div')`
  display: flex;
  justify-content: center;
`;
