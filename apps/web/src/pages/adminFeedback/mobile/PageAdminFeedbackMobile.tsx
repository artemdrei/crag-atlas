import { styled } from '@mui/material/styles';

import {
  FeedbackCard,
  FeedbackListState,
  LoadMoreButton,
  useApiFeedback
} from '../common';

export const PageAdminFeedbackMobile = () => {
  const { feedback, isLoading, isLoadingMore, hasMore, failure, loadMore } =
    useApiFeedback();

  return (
    <SectionStyled>
      <FeedbackListState
        count={feedback.length}
        isLoading={isLoading}
        failure={failure}
      >
        {feedback.map((entry) => (
          <FeedbackCard key={entry.id} entry={entry} />
        ))}
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
  gap: ${({ theme }) => theme.spacing(1)};
`;
