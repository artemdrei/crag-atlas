import { Plural, useLingui } from '@lingui/react/macro';
import PhishingIcon from '@mui/icons-material/Phishing';
import CardActionArea from '@mui/material/CardActionArea';
import Rating from '@mui/material/Rating';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { GradeBadge } from '@web/shared/ui';

import type { Route } from '../entities';

export interface Props {
  route: Route;
  number?: number;
  isHighlighted?: boolean;
  onOpen: (route: Route) => void;
  onHover?: (idRoute?: string) => void;
}

export const RouteCard = ({
  route,
  number,
  isHighlighted,
  onOpen,
  onHover
}: Props) => {
  const { t } = useLingui();

  return (
    <RowStyled
      isHighlighted={!!isHighlighted}
      onMouseEnter={() => onHover?.(route.id)}
      onMouseLeave={() => onHover?.(undefined)}
    >
      <CardAreaStyled onClick={() => onOpen(route)}>
        <NumberBadgeStyled>{number ?? '—'}</NumberBadgeStyled>
        <TextStyled>
          <Typography variant="subtitle2" noWrap>
            {route.name}
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
        <GradeBadge grade={route.grade} scale={route.gradeScale} />
      </CardAreaStyled>
    </RowStyled>
  );
};

const RowStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isHighlighted'
})<{ isHighlighted: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding-right: ${({ theme }) => theme.spacing(0.5)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid
    ${({ theme, isHighlighted }) =>
      isHighlighted ? theme.palette.primary.main : 'transparent'};
  background: ${({ theme, isHighlighted }) =>
    isHighlighted ? theme.palette.action.hover : 'transparent'};
`;

const CardAreaStyled = styled(CardActionArea)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const NumberBadgeStyled = styled('span')`
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
  background: ${({ theme }) => theme.palette.action.hover};
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
