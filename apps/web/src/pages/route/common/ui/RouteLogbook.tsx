import { Plural, Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useUser } from '@web/app/providers';
import { TickActionsButton } from '@web/features/logTick';
import { ApiFeedback, AscentTypeBadge, UserAvatar } from '@web/shared/ui';
import { RouteMediaButton } from '@web/widgets/routeMedia';

import { useApiGetRouteLogbook } from '../hooks';

export interface Props {
  idRoute: string;
}

export const RouteLogbook = ({ idRoute }: Props) => {
  const { idUser } = useUser();
  const { ticks, isLoading, failure } = useApiGetRouteLogbook(idRoute);

  return (
    <ListStyled>
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading ascents…</Trans>}
      />
      {!isLoading && ticks.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          <Trans>Nobody has logged this route yet.</Trans>
        </Typography>
      )}
      {ticks.map((tick) => {
        const media = tick.media ?? [];

        return (
          <EntryStyled key={tick.id}>
            <HeaderRowStyled>
              <AvatarStyled
                name={tick.authorName ?? ''}
                avatarUrl={tick.avatarUrl ?? undefined}
              />
              <Typography variant="body2" noWrap>
                {tick.authorName}
              </Typography>
              <AscentTypeBadge ascentType={tick.ascentType} />
              <Typography variant="caption" color="text.secondary">
                {tick.climbedAt}
              </Typography>
              {!!tick.attempts && (
                <Typography variant="caption" color="text.secondary">
                  <Plural value={tick.attempts} one="# try" other="# tries" />
                </Typography>
              )}
              <RouteMediaButton
                idRoute={idRoute}
                hasPhoto={media.some(({ kind }) => kind === 'photo')}
                hasVideo={media.some(({ kind }) => kind === 'video')}
              />
              <SpacerStyled />
              {idUser === tick.idUser && <TickActionsButton tick={tick} />}
            </HeaderRowStyled>
            {!!tick.note && (
              <Typography variant="body2" color="text.secondary">
                {tick.note}
              </Typography>
            )}
          </EntryStyled>
        );
      })}
    </ListStyled>
  );
};

const ListStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const EntryStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => theme.spacing(1.5)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const HeaderRowStyled = styled('div')`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const AvatarStyled = styled(UserAvatar)`
  width: 24px;
  height: 24px;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
`;

const SpacerStyled = styled('span')`
  flex-grow: 1;
`;
