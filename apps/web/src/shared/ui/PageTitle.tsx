import type { ReactNode } from 'react';

import { styled } from '@mui/material/styles';
import type { TypographyProps } from '@mui/material/Typography';
import Typography from '@mui/material/Typography';

import { LocalName } from './LocalName';

export interface Props {
  name?: string;
  nameLocal?: string | null;
  variant?: TypographyProps['variant'];
  icon?: ReactNode;
  aside?: ReactNode;
}

export const PageTitle = ({
  name,
  nameLocal,
  variant = 'h4',
  icon,
  aside
}: Props) => (
  <RootStyled>
    <Typography variant={variant} noWrap>
      {name ?? '…'}
    </Typography>
    {!!name && (
      <SubtitleStyled>
        {icon}
        <LocalName isBlock name={name} nameLocal={nameLocal} />
        {aside}
      </SubtitleStyled>
    )}
  </RootStyled>
);

const RootStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.25)};
  min-width: 0;
`;

const SubtitleStyled = styled('div')`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.75)};
  min-width: 0;

  &:empty {
    display: none;
  }
`;
