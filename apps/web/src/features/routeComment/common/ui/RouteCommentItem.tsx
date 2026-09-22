import type { MouseEvent } from 'react';

import { useLingui } from '@lingui/react/macro';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useModal } from '@web/app/providers';
import { formatDateTime } from '@web/shared/lib';
import { UserAvatar } from '@web/shared/ui';

import type { RouteComment } from '../entities';
import { useRouteCommentPermissions } from '../hooks';

export interface Props {
  comment: RouteComment;
}

export const RouteCommentItem = ({ comment }: Props) => {
  const { i18n, t } = useLingui();
  const { openModal } = useModal();
  const { canEdit, canDelete } = useRouteCommentPermissions(comment.idUser);

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) =>
    openModal(
      'ROUTE_COMMENT_MENU',
      {
        idRoute: comment.idRoute,
        idComment: comment.id,
        body: comment.body,
        canEdit,
        canDelete
      },
      { anchorEl: event.currentTarget }
    );

  return (
    <CommentStyled>
      <AvatarStyled name={comment.authorName} avatarUrl={comment.avatarUrl} />
      <BodyStyled>
        <HeaderRowStyled>
          <AuthorStyled variant="subtitle2">{comment.authorName}</AuthorStyled>
          <Typography variant="caption" color="text.secondary">
            {formatDateTime(comment.createdAt, i18n.locale)}
          </Typography>
          {(canEdit || canDelete) && (
            <ActionsButtonStyled
              size="small"
              aria-label={t`Comment actions`}
              onClick={handleOpenMenu}
            >
              <MoreVertIcon fontSize="small" />
            </ActionsButtonStyled>
          )}
        </HeaderRowStyled>
        <Typography variant="body2">{comment.body}</Typography>
      </BodyStyled>
    </CommentStyled>
  );
};

const CommentStyled = styled('div')`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(1.5)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const AvatarStyled = styled(UserAvatar)`
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.palette.text.secondary};
  background: ${({ theme }) => theme.palette.action.hover};
`;

const BodyStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  min-width: 0;
  flex: 1 1 auto;
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

const ActionsButtonStyled = styled(IconButton)`
  margin-left: auto;
`;
