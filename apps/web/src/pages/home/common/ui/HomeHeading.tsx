import { Trans } from '@lingui/react/macro';
import type { TypographyProps } from '@mui/material/Typography';
import Typography from '@mui/material/Typography';

export interface Props {
  variant?: TypographyProps['variant'];
}

export const HomeHeading = ({ variant = 'h4' }: Props) => (
  <Typography variant={variant}>
    <Trans>Find your next climb</Trans>
  </Typography>
);
