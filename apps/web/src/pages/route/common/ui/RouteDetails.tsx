import { Plural, Trans, useLingui } from '@lingui/react/macro';
import HeightIcon from '@mui/icons-material/Height';
import PhishingIcon from '@mui/icons-material/Phishing';
import Rating from '@mui/material/Rating';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { localNameOf } from '@web/shared/lib';
import { GradeBadge, UserAvatar } from '@web/shared/ui';

import type { Route } from '../entities';

export interface Props {
  route: Route;
}

const AVATAR_SIZE = 22;

export const RouteDetails = ({ route }: Props) => {
  const { t } = useLingui();

  const localName = localNameOf(route.name, route.nameLocal);

  return (
    <ContainerStyled>
      <TitleStyled>
        <Typography variant="h4" noWrap>
          {route.name}
        </Typography>
        {!!localName && (
          <LocalNameStyled variant="subtitle1" color="text.secondary" noWrap>
            {localName}
          </LocalNameStyled>
        )}
      </TitleStyled>
      <SummaryRowStyled>
        <GradeBadge
          grade={route.grade}
          scale={route.gradeScale}
          size="medium"
        />
        <MetaStyled variant="body2" color="text.secondary">
          {!!route.rating && (
            <span>
              <Rating
                value={route.rating}
                precision={0.5}
                size="small"
                readOnly
              />
              {route.rating.toFixed(1)}
            </span>
          )}
          {!!route.length && (
            <span>
              <HeightIcon fontSize="inherit" />
              {t`${route.length} m`}
            </span>
          )}
          {!!route.boltsCount && (
            <span>
              <PhishingIcon fontSize="inherit" />
              <Plural value={route.boltsCount} one="# bolt" other="# bolts" />
            </span>
          )}
        </MetaStyled>
      </SummaryRowStyled>
      {(!!route.bolterName || !!route.boltedYear) && (
        <MetaStyled variant="body2" color="text.secondary">
          <span>
            {route.bolterName ? (
              <>
                <Trans>Bolted by:</Trans>
                <ClimberStyled>
                  <UserAvatar
                    name={route.bolterName}
                    avatarUrl={route.bolterAvatarUrl}
                    size={AVATAR_SIZE}
                    maxInitials={1}
                  />
                  <span>
                    {route.bolterName}
                    {!!route.boltedYear && `, ${route.boltedYear}`}
                  </span>
                </ClimberStyled>
              </>
            ) : (
              <Trans>Bolted in {route.boltedYear}</Trans>
            )}
          </span>
        </MetaStyled>
      )}
      {!!route.description && (
        <Typography variant="body1">{route.description}</Typography>
      )}
    </ContainerStyled>
  );
};

const TitleStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.25)};
`;

const LocalNameStyled = styled(Typography)`
  line-height: 1.2;
` as typeof Typography;

const ContainerStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const SummaryRowStyled = styled('div')`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const MetaStyled = styled(Typography)`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};

  & > span {
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(0.5)};
  }

  & > span + span::before {
    content: "·";
    margin-right: ${({ theme }) => theme.spacing(1.5)};
  }
` as typeof Typography;

const ClimberStyled = styled('span')`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.75)};
`;
