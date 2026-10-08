import { styled } from '@mui/material/styles';

import { FeedbackListState, LoadMoreButton, useApiFeedback } from '../common';
import { FeedbackTable } from './ui';

export const PageAdminFeedbackDesktop = () => {
  const { feedback, isLoading, isLoadingMore, hasMore, failure, loadMore } =
    useApiFeedback();

  return (
    <SectionStyled>
      <FeedbackListState
        count={feedback.length}
        isLoading={isLoading}
        failure={failure}
      >
        <FeedbackTable feedback={feedback} />
        <LoadMoreButton
          hasMore={hasMore}
          isLoading={isLoadingMore}
          onLoadMore={loadMore}
        />
      </FeedbackListState>
    </SectionStyled>
  );
};

const SectionStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;
