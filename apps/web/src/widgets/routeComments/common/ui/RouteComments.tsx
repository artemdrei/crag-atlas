import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { getInitials } from '@web/shared/lib';
import { AscentStyleBadge } from '@web/shared/ui';

import type { RouteComment } from '../entities';

export interface Props {
  comments: RouteComment[];
}

export const RouteComments = ({ comments }: Props) => (
  <ListStyled>
    {comments.map((comment) => (
      <CommentStyled key={comment.id}>
        <AvatarStyled>{getInitials(comment.author)}</AvatarStyled>
        <BodyStyled>
          <HeaderRowStyled>
            <AuthorStyled variant="subtitle2">{comment.author}</AuthorStyled>
            <Typography variant="caption" color="text.secondary">
              {comment.postedAt}
            </Typography>
            {!!comment.ascentStyle && (
              <AscentStyleBadge ascentStyle={comment.ascentStyle} />
            )}
          </HeaderRowStyled>
          <Typography variant="body2">{comment.text}</Typography>
        </BodyStyled>
      </CommentStyled>
    ))}
  </ListStyled>
);

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

const AuthorStyled = styled(Typography)`
  font-weight: 700;
`;

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;
