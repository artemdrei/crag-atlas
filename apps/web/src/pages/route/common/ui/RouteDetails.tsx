import { Plural, useLingui } from '@lingui/react/macro';
import HeightIcon from '@mui/icons-material/Height';
import PhishingIcon from '@mui/icons-material/Phishing';
import Rating from '@mui/material/Rating';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { GradeBadge } from '@web/shared/ui';

import type { Route } from '../entities';

export interface Props {
  route: Route;
}

export const RouteDetails = ({ route }: Props) => {
  const { t } = useLingui();

  return (
    <ContainerStyled>
      <Typography variant="h4" noWrap>
        {route.name}
      </Typography>
      <SummaryRowStyled>
        <GradeBadge grade={route.grade} scale={route.gradeScale} />
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
      {!!route.description && (
        <Typography variant="body1">{route.description}</Typography>
      )}
    </ContainerStyled>
  );
};

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
