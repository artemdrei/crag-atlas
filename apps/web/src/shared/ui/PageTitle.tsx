import { styled } from '@mui/material/styles';
import type { TypographyProps } from '@mui/material/Typography';
import Typography from '@mui/material/Typography';

import { LocalName } from './LocalName';

export interface Props {
  name?: string;
  nameLocal?: string | null;
  variant?: TypographyProps['variant'];
}

export const PageTitle = ({ name, nameLocal, variant = 'h4' }: Props) => (
  <RootStyled>
    <Typography variant={variant} noWrap>
      {name ?? '…'}
    </Typography>
    {!!name && <LocalName isBlock name={name} nameLocal={nameLocal} />}
  </RootStyled>
);

const RootStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.25)};
  min-width: 0;
`;
