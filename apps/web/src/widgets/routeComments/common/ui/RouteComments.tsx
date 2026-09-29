import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import {
  RouteCommentComposer,
  RouteCommentItem
} from '@web/features/routeComment';
import { ApiFeedback, ListSkeleton } from '@web/shared/ui';

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
        <Typography variant="body2" color="text.secondary">
          <Trans>No comments yet — be the first to add beta.</Trans>
        </Typography>
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
