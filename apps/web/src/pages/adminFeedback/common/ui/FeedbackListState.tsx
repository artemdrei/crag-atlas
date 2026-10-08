import type { ReactNode } from 'react';

import type { Failure } from '@crag-atlas/utils';
import { Trans } from '@lingui/react/macro';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';

import { ApiFeedback, EmptyState, ListSkeleton } from '@web/shared/ui';

export interface Props {
  count: number;
  isLoading: boolean;
  failure: Failure | null;
  children: ReactNode;
}

export const FeedbackListState = ({
  count,
  isLoading,
  failure,
  children
}: Props) => {
  if (isLoading) return <ListSkeleton variant="row" />;

  if (failure) return <ApiFeedback failure={failure} />;

  if (count === 0) {
    return (
      <EmptyState
        icon={<ForumOutlinedIcon />}
        message={<Trans>No feedback yet</Trans>}
      />
    );
  }

  return children;
};
