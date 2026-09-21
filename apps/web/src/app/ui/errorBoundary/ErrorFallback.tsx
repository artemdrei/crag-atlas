import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  onReload: () => void;
}

export const ErrorFallback = ({ onReload }: Props) => (
  <FallbackStyled>
    <Typography variant="h6">
      <Trans>Something went wrong</Trans>
    </Typography>
    <Typography variant="body2" color="text.secondary">
      <Trans>
        This screen could not be drawn. Reloading usually gets past it.
      </Trans>
    </Typography>
    <Button variant="contained" onClick={onReload}>
      <Trans>Reload</Trans>
    </Button>
  </FallbackStyled>
);

const FallbackStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  height: 100%;
  min-height: 240px;
  padding: ${({ theme }) => theme.spacing(4, 3)};
  text-align: center;
`;
