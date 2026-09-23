import { Link } from 'react-router';

import { Plural, useLingui } from '@lingui/react/macro';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useUser } from '@web/app/providers';
import { buildRoutePath } from '@web/app/router/routes';
import { TickActionsButton } from '@web/features/logTick';
import { formatDateTime } from '@web/shared/lib';
import { AscentTypeBadge, GradeBadge, UserAvatar } from '@web/shared/ui';

import type { Tick } from '../entities';

export interface Props {
  tick: Tick;
}

export const TickCard = ({ tick }: Props) => {
  const { i18n } = useLingui();
  const { idUser } = useUser();
  const isMine = !!idUser && idUser === tick.idUser;
  const title = `${tick.sectorName ? `${tick.sectorName} · ` : ''}${tick.routeName ?? tick.idRoute}`;

  return (
    <CardStyled elevation={0}>
      <HeaderRowStyled>
        <TitleGroupStyled>
          {tick.idRegion && tick.idSector ? (
            <TitleLinkStyled
              to={buildRoutePath(tick.idRegion, tick.idSector, tick.idRoute)}
            >
              <Typography variant="subtitle1" noWrap>
                {title}
              </Typography>
            </TitleLinkStyled>
          ) : (
            <Typography variant="subtitle1" noWrap>
              {title}
            </Typography>
          )}
          {tick.routeGrade && (
            <GradeBadge grade={tick.routeGrade} scale={tick.routeGradeScale} />
          )}
          <AscentTypeBadge ascentType={tick.ascentType} />
        </TitleGroupStyled>
        {isMine && <TickActionsButton tick={tick} />}
      </HeaderRowStyled>

      <AuthorRowStyled>
        {!isMine && tick.authorName && (
          <>
            <AvatarStyled
              name={tick.authorName}
              avatarUrl={tick.avatarUrl ?? undefined}
            />
            <Typography variant="body2">{tick.authorName}</Typography>
            <Typography variant="body2" color="text.secondary">
              ·
            </Typography>
          </>
        )}
        <Typography variant="body2" color="text.secondary">
          {formatDateTime(tick.createdAt, i18n.locale)}
          {tick.attempts ? (
            <>
              {' · '}
              <Plural
                value={tick.attempts}
                one="# try"
                few="# tries"
                many="# tries"
                other="# tries"
              />
            </>
          ) : null}
        </Typography>
      </AuthorRowStyled>

      {tick.note && <Typography variant="body2">{tick.note}</Typography>}
    </CardStyled>
  );
};

const TitleLinkStyled = styled(Link)`
  min-width: 0;
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const CardStyled = styled(Paper)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(2.5)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const AuthorRowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const AvatarStyled = styled(UserAvatar)`
  width: 24px;
  height: 24px;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
`;

const TitleGroupStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
`;

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;
