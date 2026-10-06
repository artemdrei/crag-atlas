import type { ReactNode } from 'react';

import { Trans } from '@lingui/react/macro';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import TimelineIcon from '@mui/icons-material/Timeline';
import TuneIcon from '@mui/icons-material/Tune';
import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { type LoginBenefitKind, useLoginBenefits } from '../../common';

const ICONS: Record<LoginBenefitKind, ReactNode> = {
  logbook: <TimelineIcon />,
  offline: <CloudDownloadOutlinedIcon />,
  filters: <TuneIcon />,
  community: <GroupsIcon />
};

export const LoginBenefits = () => {
  const benefits = useLoginBenefits();

  return (
    <ContentStyled>
      <HeadingStyled variant="h5">
        <Trans>Your climbing, all in one place</Trans>
      </HeadingStyled>

      <ListStyled>
        {benefits.map(({ kind, title, description }) => (
          <ItemStyled key={kind}>
            <IconStyled>{ICONS[kind]}</IconStyled>
            <div>
              <TitleStyled variant="subtitle1">{title}</TitleStyled>
              <DescriptionStyled variant="body2">
                {description}
              </DescriptionStyled>
            </div>
          </ItemStyled>
        ))}
      </ListStyled>
    </ContentStyled>
  );
};

const ContentStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  max-width: 520px;
  color: ${({ theme }) => theme.palette.primary.contrastText};
`;

const HeadingStyled = styled(Typography)`
  font-weight: 700;
`;

const ListStyled = styled('ul')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  margin: ${({ theme }) => theme.spacing(2, 0, 0)};
  padding: 0;
  list-style: none;
`;

const ItemStyled = styled('li')`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2, 2.5)};
  border: 1px solid
    ${({ theme }) => alpha(theme.palette.primary.contrastText, 0.18)};
  border-radius: calc(${({ theme }) => theme.shape.borderRadius}px * 1.5);
  background-color: ${({ theme }) =>
    alpha(theme.palette.primary.contrastText, 0.1)};
  backdrop-filter: blur(6px);
`;

const IconStyled = styled('span')`
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: ${({ theme }) =>
    alpha(theme.palette.primary.contrastText, 0.18)};
`;

const TitleStyled = styled(Typography)`
  font-weight: 600;
`;

const DescriptionStyled = styled(Typography)`
  opacity: 0.85;
`;
