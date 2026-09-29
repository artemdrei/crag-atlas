import { Plural, useLingui } from '@lingui/react/macro';
import CheckIcon from '@mui/icons-material/Check';
import PhishingIcon from '@mui/icons-material/Phishing';
import CardActionArea from '@mui/material/CardActionArea';
import Rating from '@mui/material/Rating';
import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { resolveAscentTypeInk } from '@web/shared/theme/palette';
import { GradeBadge, LocalName } from '@web/shared/ui';
import { RouteMediaButton } from '@web/widgets/routeMedia';

import type { Route } from '../entities';

export interface Props {
  route: Route;
  number?: number;
  isHighlighted?: boolean;
  isTicked?: boolean;
  onOpen: (route: Route) => void;
  onHover?: (idRoute?: string) => void;
}

export const RouteCard = ({
  route,
  number,
  isHighlighted,
  isTicked,
  onOpen,
  onHover
}: Props) => {
  const { t } = useLingui();

  return (
    <RowStyled
      isHighlighted={!!isHighlighted}
      isTicked={!!isTicked}
      onMouseEnter={() => onHover?.(route.id)}
      onMouseLeave={() => onHover?.(undefined)}
    >
      <CardAreaStyled onClick={() => onOpen(route)}>
        <NumberBadgeStyled isTicked={!!isTicked}>
          {number ?? '—'}
          {isTicked && <CheckIconStyled titleAccess={t`Climbed`} />}
        </NumberBadgeStyled>
        <TextStyled>
          <Typography variant="subtitle2" noWrap>
            {route.name}
            <LocalName name={route.name} nameLocal={route.nameLocal} />
          </Typography>
          <MetaStyled variant="caption" color="text.secondary" noWrap>
            {!!route.rating && (
              <MetaItemStyled>
                <RatingStyled
                  value={route.rating}
                  precision={0.5}
                  size="small"
                  readOnly
                />
                {route.rating.toFixed(1)}
              </MetaItemStyled>
            )}
            {!!route.ascentsCount && (
              <span>
                <Plural
                  value={route.ascentsCount}
                  one="# ascent"
                  other="# ascents"
                />
              </span>
            )}
            {!!route.length && <span>{t`${route.length} m`}</span>}
            {!!route.boltsCount && (
              <MetaItemStyled>
                <PhishingIcon fontSize="inherit" />
                {route.boltsCount}
              </MetaItemStyled>
            )}
          </MetaStyled>
        </TextStyled>
      </CardAreaStyled>
      {/* Outside the action area: a button nested in a button is invalid. */}
      <RouteMediaButton
        idRoute={route.id}
        hasPhoto={route.hasPhoto}
        hasVideo={route.hasVideo}
      />
      <GradeBadge grade={route.grade} scale={route.gradeScale} />
    </RowStyled>
  );
};

const RowStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isHighlighted' && prop !== 'isTicked'
})<{ isHighlighted: boolean; isTicked: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding-right: ${({ theme }) => theme.spacing(0.5)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid
    ${({ theme, isHighlighted }) =>
      isHighlighted ? theme.palette.primary.main : 'transparent'};
  background: ${({ theme, isTicked }) =>
    isTicked
      ? alpha(resolveAscentTypeInk(theme.palette.mode, 'onsight'), 0.16)
      : 'transparent'};

  &:hover {
    background: ${({ theme, isTicked }) =>
      isTicked
        ? alpha(resolveAscentTypeInk(theme.palette.mode, 'onsight'), 0.3)
        : theme.palette.action.hover};
  }
`;

const CardAreaStyled = styled(CardActionArea)`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;

  /* The row paints the hover; this overlay would tint only half of it. */
  &:hover .MuiCardActionArea-focusHighlight {
    opacity: 0;
  }
`;

const NumberBadgeStyled = styled('span', {
  shouldForwardProp: (prop) => prop !== 'isTicked'
})<{ isTicked: boolean }>`
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  font-weight: 700;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.palette.text.secondary};
  background: ${({ theme, isTicked }) =>
    isTicked ? theme.palette.background.paper : theme.palette.action.hover};
`;

const CheckIconStyled = styled(CheckIcon)`
  position: absolute;
  right: -4px;
  bottom: -4px;
  padding: 1px;
  font-size: 12px;
  border-radius: 50%;
  color: ${({ theme }) => theme.palette.background.paper};
  background: ${({ theme }) =>
    resolveAscentTypeInk(theme.palette.mode, 'onsight')};
`;

const MetaStyled = styled(Typography)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};

  & > span + span::before {
    content: "· ";
  }
` as typeof Typography;

const MetaItemStyled = styled('span')`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const RatingStyled = styled(Rating)`
  font-size: inherit;
`;

const TextStyled = styled('div')`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 0;
`;
