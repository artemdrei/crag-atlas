import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { getInitials } from '@web/shared/lib';
import { ApiFeedback } from '@web/shared/ui';

import { useApiGetRouteComments } from '../hooks';

export interface Props {
  idRoute: string;
}

export const RouteComments = ({ idRoute }: Props) => {
  const { comments, isLoading, failure } = useApiGetRouteComments(idRoute);

  return (
    <ListStyled>
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading comments…</Trans>}
      />
      {!isLoading && comments.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          <Trans>No comments yet — be the first to add beta.</Trans>
        </Typography>
      )}
      {comments.map((comment) => (
        <CommentStyled key={comment.id}>
          <AvatarStyled>{getInitials(comment.authorName)}</AvatarStyled>
          <BodyStyled>
            <HeaderRowStyled>
              <AuthorStyled variant="subtitle2">
                {comment.authorName}
              </AuthorStyled>
              <Typography variant="caption" color="text.secondary">
                {comment.createdAt.slice(0, 10)}
              </Typography>
            </HeaderRowStyled>
            <Typography variant="body2">{comment.body}</Typography>
          </BodyStyled>
        </CommentStyled>
      ))}
    </ListStyled>
  );
};

const ListStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const CommentStyled = styled('div')`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(1.5)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const AvatarStyled = styled('span')`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.palette.text.secondary};
  background: ${({ theme }) => theme.palette.action.hover};
`;

const BodyStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  min-width: 0;
`;

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const AuthorStyled = styled(Typography)`
  font-weight: 700;
`;
