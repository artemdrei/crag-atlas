import { Fragment } from 'react';
import { Link } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useUser } from '@web/app/providers';
import {
  buildRegionPath,
  buildRoutePath,
  buildSectorPath
} from '@web/app/router/routes';
import { TickActionsButton } from '@web/features/logTick';
import {
  countryName,
  formatDateTime,
  trackCatalogItemOpened
} from '@web/shared/lib';
import {
  AscentTypeBadge,
  GradeBadge,
  LocalName,
  UserAvatar
} from '@web/shared/ui';
import { RouteMediaButton } from '@web/widgets/routeMedia';

import type { Tick } from '../entities';

interface Place {
  key: string;
  label: string;
  to?: string;
}

export interface Props {
  tick: Tick;
  isCommunity?: boolean;
  isGradeHidden?: boolean;
}

export const TickCard = ({ tick, isCommunity, isGradeHidden }: Props) => {
  const { i18n } = useLingui();
  const { idUser } = useUser();
  const isMine = !!idUser && idUser === tick.idUser;
  const title = tick.routeName ?? tick.idRoute;
  const places: Place[] = [
    tick.regionCountry
      ? { key: 'country', label: countryName(tick.regionCountry) }
      : null,
    tick.regionName
      ? {
          key: 'region',
          label: tick.regionName,
          to: tick.idRegion ? buildRegionPath(tick.idRegion) : undefined
        }
      : null,
    tick.sectorName
      ? {
          key: 'sector',
          label: tick.sectorName,
          to:
            tick.idRegion && tick.idSector
              ? buildSectorPath(tick.idRegion, tick.idSector)
              : undefined
        }
      : null
  ].filter((place): place is Place => !!place);

  const trackOpen = (
    name: string,
    idSector?: string | null,
    idRoute?: string | null
  ) =>
    trackCatalogItemOpened({
      name,
      source: 'logbook',
      idRegion: tick.idRegion ?? '',
      idSector,
      idRoute
    });

  return (
    <CardStyled elevation={0}>
      {tick.idRegion && tick.idSector && (
        <CardLinkStyled
          to={buildRoutePath(tick.idRegion, tick.idSector, tick.idRoute)}
          aria-label={title}
          onClick={() => trackOpen(title, tick.idSector, tick.idRoute)}
        />
      )}
      <HeaderRowStyled>
        <TitleGroupStyled>
          <TitleStyled>
            <NameRowStyled>
              <Typography variant="h6" noWrap>
                {title}
                <LocalName name={title} nameLocal={tick.routeNameLocal} />
              </Typography>
              {!isGradeHidden && tick.routeGrade && (
                <GradeBadge
                  grade={tick.routeGrade}
                  scale={tick.routeGradeScale}
                />
              )}
            </NameRowStyled>
            {places.length > 0 && (
              <PlaceRowStyled>
                {places.map(({ key, label, to }, index) => (
                  <Fragment key={key}>
                    {index > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        ·
                      </Typography>
                    )}
                    {to ? (
                      <PlaceLinkStyled
                        to={to}
                        onClick={() =>
                          trackOpen(
                            label,
                            key === 'sector' ? tick.idSector : undefined
                          )
                        }
                      >
                        {label}
                      </PlaceLinkStyled>
                    ) : (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {label}
                      </Typography>
                    )}
                  </Fragment>
                ))}
              </PlaceRowStyled>
            )}
          </TitleStyled>
        </TitleGroupStyled>
        <ActionsStyled>
          <RouteMediaButton
            idRoute={tick.idRoute}
            hasPhoto={!!tick.routeHasPhoto}
            hasVideo={!!tick.routeHasVideo}
          />
          {isMine && <TickActionsButton tick={tick} />}
        </ActionsStyled>
      </HeaderRowStyled>

      {tick.note && <Typography variant="body2">{tick.note}</Typography>}

      {tick.partnerName && (
        <Typography variant="body2" color="text.secondary">
          <Trans>Belayer</Trans>: {tick.partnerName}
        </Typography>
      )}

      <AuthorRowStyled>
        {isCommunity && tick.authorName && (
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
        </Typography>
        {!!tick.rating && (
          <Rating value={tick.rating} precision={0.5} size="small" readOnly />
        )}
        <AscentTypeBadge
          ascentType={tick.ascentType}
          attempts={tick.attempts}
        />
      </AuthorRowStyled>
    </CardStyled>
  );
};

const CardLinkStyled = styled(Link)`
  position: absolute;
  inset: 0;
  border-radius: inherit;
`;

const ActionsStyled = styled('span')`
  position: relative;
  z-index: 1;
  display: flex;
  flex-shrink: 0;
  align-items: center;
`;

const CardStyled = styled(Paper)`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(2.5)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;

  &:has(a:hover) {
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
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

const NameRowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  max-width: 100%;
`;

const TitleStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
`;

const PlaceRowStyled = styled('div')`
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  max-width: 100%;
  overflow: hidden;

  & > * {
    flex: 0 1 auto;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const PlaceLinkStyled = styled(Link)`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.palette.primary.main};
    text-decoration: underline;
  }
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
