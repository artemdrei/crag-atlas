import { Plural, useLingui } from '@lingui/react/macro';
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
      <HeaderRowStyled>
        <Typography variant="h4">{route.name}</Typography>
        <GradeBadge grade={route.grade} />
      </HeaderRowStyled>
      <MetaStyled variant="body2" color="text.secondary">
        <span>{route.type}</span>
        {!!route.length && <span>{t`${route.length} m`}</span>}
        {!!route.boltsCount && (
          <span>
            <Plural value={route.boltsCount} one="# bolt" other="# bolts" />
          </span>
        )}
      </MetaStyled>
      <Typography variant="body1">{route.description}</Typography>
    </ContainerStyled>
  );
};

const ContainerStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const MetaStyled = styled(Typography)`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};

  & > span + span::before {
    content: '· ';
  }
`;
