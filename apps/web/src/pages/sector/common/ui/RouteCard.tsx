import { Plural, useLingui } from '@lingui/react/macro';
import CardActionArea from '@mui/material/CardActionArea';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { GradeBadge } from '@web/shared/ui';

import type { Route } from '../entities';

export interface Props {
  route: Route;
  index: number;
  isHighlighted?: boolean;
  onOpen: (route: Route) => void;
  onHover?: (route?: Route) => void;
}

export const RouteCard = ({
  route,
  index,
  isHighlighted,
  onOpen,
  onHover
}: Props) => {
  const { t } = useLingui();

  return (
    <RowStyled
      isHighlighted={!!isHighlighted}
      onMouseEnter={() => onHover?.(route)}
      onMouseLeave={() => onHover?.(undefined)}
    >
      <CardAreaStyled onClick={() => onOpen(route)}>
        <NumberBadgeStyled>{index + 1}</NumberBadgeStyled>
        <TextStyled>
          <Typography variant="subtitle2" noWrap>
            {route.name}
          </Typography>
          <MetaStyled variant="caption" color="text.secondary" noWrap>
            <span>{route.type}</span>
            {!!route.length && <span>{t`${route.length} m`}</span>}
            {!!route.boltsCount && (
              <span>
                <Plural value={route.boltsCount} one="# bolt" other="# bolts" />
              </span>
            )}
          </MetaStyled>
        </TextStyled>
        <GradeBadge grade={route.grade} />
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
  gap: ${({ theme }) => theme.spacing(1)};

  & > span + span::before {
    content: "· ";
  }
` as typeof Typography;

const TextStyled = styled('div')`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 0;
`;
