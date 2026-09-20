import { Plural, useLingui } from '@lingui/react/macro';
import HeightIcon from '@mui/icons-material/Height';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
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
      <Typography variant="h4">{route.name}</Typography>
      <SummaryRowStyled>
        <GradeBadge grade={route.grade} />
        {!!route.rating && (
          <Rating value={route.rating} precision={0.5} size="small" readOnly />
        )}
        <MetaStyled variant="body2" color="text.secondary">
          <span>{route.type}</span>
          {!!route.length && (
            <MetaItemStyled>
              <HeightIcon fontSize="inherit" />
              {t`${route.length} m`}
            </MetaItemStyled>
          )}
          {!!route.boltsCount && (
            <MetaItemStyled>
              <LinearScaleIcon fontSize="inherit" />
              <Plural value={route.boltsCount} one="# bolt" other="# bolts" />
            </MetaItemStyled>
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
`;

const MetaItemStyled = styled('span')`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;
