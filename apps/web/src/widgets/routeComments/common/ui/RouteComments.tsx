import { Trans } from '@lingui/react/macro';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import { styled } from '@mui/material/styles';

import {
  RouteCommentComposer,
  RouteCommentItem
} from '@web/features/routeComment';
import { ApiFeedback, EmptyState, ListSkeleton } from '@web/shared/ui';

import { useApiGetRouteComments } from '../hooks';

export interface Props {
  idRoute: string;
}

export const RouteComments = ({ idRoute }: Props) => {
  const { comments, isLoading, failure } = useApiGetRouteComments(idRoute);

  return (
    <ListStyled>
      <RouteCommentComposer idRoute={idRoute} />
      <ApiFeedback failure={failure} />
      {isLoading && <ListSkeleton count={2} variant="row" />}
      {!isLoading && comments.length === 0 && (
        <EmptyState
          icon={<ChatBubbleOutlineIcon />}
          message={<Trans>No comments yet — be the first to add beta.</Trans>}
        />
      )}
      {comments.map((comment) => (
        <RouteCommentItem key={comment.id} comment={comment} />
      ))}
    </ListStyled>
  );
};

const ListStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;
