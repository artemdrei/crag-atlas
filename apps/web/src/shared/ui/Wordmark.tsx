import { Link } from 'react-router';

import { styled } from '@mui/material/styles';
import type { TypographyProps } from '@mui/material/Typography';
import Typography from '@mui/material/Typography';

export interface Props {
  variant?: TypographyProps['variant'];
  to?: string;
  className?: string;
}

export const Wordmark = ({ variant = 'h6', to, className }: Props) => {
  const linkProps = to ? { component: Link, to } : { component: 'span' };

  return (
    <WordmarkStyled variant={variant} className={className} {...linkProps}>
      <AccentStyled>crag</AccentStyled>Atlas
    </WordmarkStyled>
  );
};

const WordmarkStyled = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.primary};
  font-weight: 700;
  letter-spacing: -0.02em;
  /* A link is what a browser paints blue and underlines; a logo is neither. */
  text-decoration: none;
  white-space: nowrap;
` as typeof Typography;

const AccentStyled = styled('span')`
  color: ${({ theme }) => theme.palette.primary.main};
`;
